import requests
import os
import time

start_time = time.time()
last_time = time.time()

urls = []

with open("query.tsv", "r") as f:
    urls = ["https://www.wikidata.org/wiki/Special:EntityData/{}.json".format(line.split("\t")[0].split("/")[-1]) for line in f.readlines()]

# Create a folder to save the RDF files in
folder_name = "json_files"
if not os.path.exists(folder_name):
    os.makedirs(folder_name)

# Loop through the URLs and save the RDF files
for i, url in enumerate(urls):
    # Get the filename from the URL
    filename = url.split("/")[-1]
    # Check if the file already exists in the folder
    if os.path.exists(os.path.join(folder_name, filename)):
        print(f"Skipping {filename} as it already exists in {folder_name}")
        continue
    # Send a GET request to the URL
    response = requests.get(url)
    # Save the response content to a file in the folder
    with open(os.path.join(folder_name, filename), "wb") as f:
        f.write(response.content)
    
    end_time = time.time()
    total_time = end_time - start_time
    print(f"Processed line {i+1}/46669({((i+1)*100/46669):.2f}%) of query.tsv ({(end_time-last_time):.2f}s) (total {total_time//3600:02.0f}:{(total_time%3600)//60:02.0f}:{total_time%60:02.0f})")
    last_time = end_time


