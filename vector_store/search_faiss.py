import os
import json
import faiss
import numpy as np
from sentence_transformers import SentenceTransformer

INDEX_DIR = './vector_store/vector_index'
model = SentenceTransformer('all-MiniLM-L6-v2')


def get_available_sources():
    """Detect available FAISS indexes in INDEX_DIR."""
    sources = set()
    for file in os.listdir(INDEX_DIR):
        if file.endswith('.index'):
            sources.add(file.replace('.index', ''))
    return list(sources)


def load_index_and_metadata(source_name):
    index_path = os.path.join(INDEX_DIR, f'{source_name}.index')
    metadata_path = os.path.join(INDEX_DIR, f'{source_name}_meta.json')

    if not os.path.exists(index_path) or not os.path.exists(metadata_path):
        raise FileNotFoundError(f"Missing index or metadata for source '{source_name}'.")

    index = faiss.read_index(index_path)
    with open(metadata_path, 'r', encoding='utf-8') as f:
        metadata = json.load(f)

    return index, metadata


def search_faiss(query_text, source=None, top_k=3):
    if isinstance(source, str):
        source = [source]
    elif source is None:
        source = get_available_sources()

    query_vector = model.encode([query_text])
    query_vector = np.array(query_vector).astype('float32')

    all_results = {}

    for src in source:
        try:
            index, metadata = load_index_and_metadata(src)
            distances, indices = index.search(query_vector, top_k)

            results = []
            for i in indices[0]:
                if i < len(metadata):
                    results.append(metadata[i])

            all_results[src] = results

        except Exception as e:
            print(f"❌ Error searching {src}: {e}")
            all_results[src] = []

    return all_results


# Main Function to run the search
# This part is for testing the search functionality directly
if __name__ == "__main__":
    query = input("🔍 Enter your query: ").strip()
    results = search_faiss(query_text=query, top_k=2)

    for source, entries in results.items():
        print(f"\n📁 Source: {source}")
        for i, entry in enumerate(entries):
            title = entry.get("title") or entry.get("question") or "No title"
            print(f"  {i+1}. {title}")
