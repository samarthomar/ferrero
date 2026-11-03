import pandas as pd
import numpy as np
import os
import json
import logging
from app.config import settings

logger = logging.getLogger(__name__)

SEED_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "data", "seed")


class DataStore:
    """Singleton that holds all loaded and harmonized data."""
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(DataStore, cls).__new__(cls)
            cls._instance.df_prices = pd.DataFrame()
            cls._instance.df_fx = pd.DataFrame()
            cls._instance.df_weather = pd.DataFrame()
            cls._instance.df_inventory = pd.DataFrame()
            cls._instance.df_demand = pd.DataFrame()
            cls._instance.df_logistics = pd.DataFrame()
            cls._instance.df_macro = pd.DataFrame()
            cls._instance.unified_df = pd.DataFrame()
            cls._instance.supplier_contracts = []
            cls._instance.tariffs = {}
        return cls._instance

    def _safe_read_csv(self, filename: str) -> pd.DataFrame:
        """Safely read a CSV from the seed directory."""
        path = os.path.join(SEED_DIR, filename)
        if os.path.exists(path):
            logger.info(f"Loading {filename}...")
            return pd.read_csv(path)
        else:
            logger.warning(f"File not found: {path}")
            return pd.DataFrame()

    def _safe_read_json(self, filename: str):
        """Safely read a JSON file from the seed directory."""
        path = os.path.join(SEED_DIR, filename)
        if os.path.exists(path):
            logger.info(f"Loading {filename}...")
            with open(path, "r", encoding="utf-8") as f:
                return json.load(f)
        else:
            logger.warning(f"File not found: {path}")
            return []

    def load_all_data(self):
        """Loads all CSVs/JSONs and merges them into unified timeframe."""
        logger.info("=" * 60)
        logger.info("Loading seed data from: %s", SEED_DIR)
        logger.info("=" * 60)

        try:
            # ── 1. Hazelnut Prices (daily, multi-origin) ──
            raw_prices = self._safe_read_csv("hazelnut_prices.csv")
            if not raw_prices.empty:
                raw_prices["date"] = pd.to_datetime(raw_prices["date"])
                self.df_prices = raw_prices

                # Create a daily weighted-average price across all origins
                daily_prices = (
                    raw_prices
                    .groupby("date")
                    .apply(
                        lambda g: pd.Series({
                            "price_eur": np.average(g["price_eur_kg"], weights=g["volume_tons"]),
                            "price_usd": np.average(g["price_usd_kg"], weights=g["volume_tons"]),
                            "total_volume": g["volume_tons"].sum(),
                        })
                    )
                    .reset_index()
                )
            else:
                daily_prices = pd.DataFrame()

            # ── 2. Exchange Rates (daily) ──
            raw_fx = self._safe_read_csv("exchange_rates.csv")
            if not raw_fx.empty:
                raw_fx["date"] = pd.to_datetime(raw_fx["date"])
                self.df_fx = raw_fx

            # ── 3. Weather / Crop data (monthly) → forward-fill to daily ──
            raw_weather = self._safe_read_csv("weather_crop_data.csv")
            if not raw_weather.empty:
                raw_weather["month"] = pd.to_datetime(raw_weather["month"])
                self.df_weather = raw_weather
                # Aggregate across regions to get a single monthly row
                weather_agg = (
                    raw_weather
                    .groupby("month")
                    .agg({
                        "avg_temp_c": "mean",
                        "rainfall_mm": "mean",
                        "crop_health_index": "mean",
                        "yield_forecast_tons_per_hectare": "mean",
                    })
                    .reset_index()
                    .rename(columns={"month": "date"})
                )
            else:
                weather_agg = pd.DataFrame()

            # ── 4. Inventory (weekly) → forward-fill to daily ──
            raw_inv = self._safe_read_csv("inventory_levels.csv")
            if not raw_inv.empty:
                raw_inv["week_start"] = pd.to_datetime(raw_inv["week_start"])
                self.df_inventory = raw_inv
                # Aggregate across warehouses
                inv_agg = (
                    raw_inv
                    .groupby("week_start")
                    .agg({
                        "quantity_tons": "sum",
                        "capacity_tons": "sum",
                        "days_of_supply": "mean",
                    })
                    .reset_index()
                    .rename(columns={"week_start": "date", "quantity_tons": "inventory_tons"})
                )
            else:
                inv_agg = pd.DataFrame()

            # ── 5. Demand Forecasts (monthly) → forward-fill to daily ──
            raw_demand = self._safe_read_csv("demand_forecasts.csv")
            if not raw_demand.empty:
                raw_demand["month"] = pd.to_datetime(raw_demand["month"])
                self.df_demand = raw_demand
                # Sum across product lines per month
                demand_agg = (
                    raw_demand
                    .groupby("month")
                    .agg({"forecast_tons": "sum", "actual_tons": "sum"})
                    .reset_index()
                    .rename(columns={"month": "date", "forecast_tons": "demand_tons"})
                )
            else:
                demand_agg = pd.DataFrame()

            # ── 6. Logistics Costs (monthly) ──
            raw_logistics = self._safe_read_csv("logistics_costs.csv")
            if not raw_logistics.empty:
                raw_logistics["month"] = pd.to_datetime(raw_logistics["month"])
                self.df_logistics = raw_logistics

            # ── 7. Macro Indicators (monthly) ──
            raw_macro = self._safe_read_csv("macro_indicators.csv")
            if not raw_macro.empty:
                raw_macro["month"] = pd.to_datetime(raw_macro["month"])
                self.df_macro = raw_macro

            # ── 8. Supplier Contracts (JSON) ──
            self.supplier_contracts = self._safe_read_json("supplier_contracts.json")

            # ── 9. Tariffs (JSON) ──
            self.tariffs = self._safe_read_json("tariffs.json")

            # ── Build Unified Daily DataFrame ──
            if not daily_prices.empty:
                unified = daily_prices.set_index("date")

                if not raw_fx.empty:
                    fx = raw_fx.set_index("date")[["eur_usd", "eur_try"]]
                    unified = unified.join(fx, how="left")

                if not inv_agg.empty:
                    inv = inv_agg.set_index("date")[["inventory_tons", "capacity_tons", "days_of_supply"]]
                    unified = unified.join(inv, how="left")

                if not demand_agg.empty:
                    dem = demand_agg.set_index("date")[["demand_tons"]]
                    unified = unified.join(dem, how="left")

                if not weather_agg.empty:
                    wt = weather_agg.set_index("date")[["crop_health_index", "avg_temp_c", "rainfall_mm"]]
                    unified = unified.join(wt, how="left")

                # Forward-fill weekly/monthly data to daily, then back-fill any leading NaNs
                unified = unified.ffill().bfill()
                unified = unified.reset_index()

                self.unified_df = unified
                logger.info(
                    "Unified DataFrame built: %d rows, %d columns, range %s to %s",
                    len(unified), len(unified.columns),
                    unified["date"].min().strftime("%Y-%m-%d"),
                    unified["date"].max().strftime("%Y-%m-%d"),
                )
            else:
                logger.warning("No price data loaded — unified DataFrame is empty.")

            logger.info("=" * 60)
            logger.info("Data loading complete.")
            logger.info("=" * 60)

        except Exception as e:
            logger.error(f"Error loading data: {e}", exc_info=True)


data_store = DataStore()
