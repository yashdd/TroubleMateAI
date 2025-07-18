import json
import os
import faiss
import numpy as np

DATA_DIR = './scraper/data'
INDEX_DIR = './vector_store/vector_index'

os.makedirs(INDEX_DIR, exist_ok=True)

def load_json_embeddings(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    clean_data = []
    for item in data:
        if 'embedding' in item and isinstance(item['embedding'], list):
            if id in item:
                item_id = str(item['id'])
            elif 'repo' in item and 'number' in item:
                item_id = f"{item['repo']}#{item['number']}"
            else:
                item_id = f"unkown_{len(clean_data)}"
            clean_data.append((item_id, np.array(item['embedding'], dtype='float32'), item))
        else:
            print(f"Skipping item without valid embedding: {item}")
    return clean_data

def build_faiss_index(name, data):
    dim = len(data[0][1])
    index = faiss.IndexFlatL2(dim)

    ids = []
    meta = []

    vectors = np.array([vec for _, vec, _ in data])
    index.add(vectors)

    for id_, _, full_obj in data:
        ids.append(id_)
        meta.append(full_obj)

    faiss.write_index(index, os.path.join(INDEX_DIR, f'{name}.index'))
    with open(os.path.join(INDEX_DIR, f'{name}_meta.json'), 'w', encoding='utf-8') as f:
        json.dump(meta, f, indent=2)

    print(f"✅ {name} FAISS index built with {len(data)} entries.")

if __name__ == "__main__":
    sources = {
        'stack': 'stackoverflow_data_embedded.json',
        'github': 'github_issues_embedded.json',
        'reddit': 'reddit_posts_embedded.json',
    }

    for name, file in sources.items():
        full_path = os.path.join(DATA_DIR, file)
        data = load_json_embeddings(full_path)
        if data:
            build_faiss_index(name, data)
