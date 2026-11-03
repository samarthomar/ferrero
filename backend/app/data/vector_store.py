import os
import logging
from app.config import settings

logger = logging.getLogger(__name__)

class VectorStore:
    def __init__(self):
        self.client = None
        self.collection = None
        self.is_ready = False
        
    def initialize(self):
        try:
            import chromadb
            from chromadb.config import Settings
            
            self.client = chromadb.PersistentClient(path=os.path.join(settings.DATA_DIR, "chroma_db"))
            self.collection = self.client.get_or_create_collection(name="market_reports")
            self.is_ready = True
            logger.info("ChromaDB initialized.")
        except ImportError:
            logger.warning("chromadb not found. Falling back to keyword search.")
            self.is_ready = False

    def search(self, query: str, top_k: int = 3):
        if self.is_ready and self.collection:
            results = self.collection.query(query_texts=[query], n_results=top_k)
            return results
        else:
            return {"documents": [["Fallback keyword search result 1", "Fallback keyword search result 2"]], "metadatas": [[{"source": "fake_report.pdf"}]]}

vector_store = VectorStore()
