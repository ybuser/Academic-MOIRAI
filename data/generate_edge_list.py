
import os
import json
import csv

# Define the paths to the input and output files
input_dir = "shorter_json_files"
node_output_file = "node_list.csv"
edge_output_file = "edge_list.csv"
desc_output_file = "desc_list.csv"

# Create empty lists to store the node and edge data
node_data = []
edge_data = []
desc_data = []
desc_tag = set()

no_id = 0
no_eng_name = 0
no_desc = 0
no_birth = 0
no_death = 0
no_edge_end = 0
no_edge = 0

node_count = 0
edge_count = 0

# Loop through each file in the input directory
for filename in os.listdir(input_dir):
    # Open the file and load the JSON data
    with open(os.path.join(input_dir, filename), "r") as f:
        data = json.load(f)
    
    # Extract the node data and append it to the node_data list

    for entity_id, entity_data in data['entities'].items():

        node_count += 1
        try:
            node_id = entity_data["id"]
        except:
            node_desc = ""
            no_id += 1
            continue


        try:
            node_name = entity_data["labels"]["en"]["value"]
        except:
            node_name = entity_data["labels"].popitem()[1]["value"]
            no_eng_name += 1


        try:
            node_desc = entity_data["descriptions"]["en"]["value"]
        except:
            node_desc = ""
            no_desc += 1


        try:
            node_birth = entity_data["claims"]["P569"][0]["mainsnak"]["datavalue"]["value"]["time"]
        except:
            node_birth = ""
            no_birth += 1

        try:
            node_death = entity_data["claims"]["P570"][0]["mainsnak"]["datavalue"]["value"]["time"]
        except:
            node_death = ""
            no_death += 1

        node_data.append([node_id, node_name, node_desc, node_birth, node_death])
        this_has_edge = False

        for property_id, claims in entity_data['claims'].items():
            edge_count += 1
            edge_type = property_id

            this_has_edge = True
            edge_to_node = False

            try:
                if claims[0]['mainsnak']['snaktype'] == "somevalue" or claims[0]['mainsnak']['snaktype'] == "novalue":
                    continue

                match (claims[0]['mainsnak']['datavalue']['type']):
                    case "wikibase-entityid":
                            value = claims[0]['mainsnak']['datavalue']['value']['id']
                            edge_to_node = True
                    case "time":
                            value = claims[0]['mainsnak']['datavalue']['value']['time']
                    case "quantity":
                            value = claims[0]['mainsnak']['datavalue']['value']['amount']
                    case "monolingualtext":
                            value = claims[0]['mainsnak']['datavalue']['value']['text']
                    case "globecoordinate":
                            value = claims[0]['mainsnak']['datavalue']['value']['latitude']
                    case _:
                            value = claims[0]['mainsnak']['datavalue']['value']
                              
            except:
                value = ""
                print(f"Unknown type for {node_id}: claims[0]['mainsnak']['datavalue']['type'] = {claims[0]['mainsnak']['datavalue']['type']}")
                print()
                no_edge_end += 1

            if (edge_to_node):
                edge_data.append([node_id, edge_type, value])
            else:
                desc_data.append([node_id, edge_type, value])
                desc_tag.add(edge_type)
        
        if this_has_edge == False:
            no_edge += 1

print(f"Processed files in {input_dir}")
print(f"no id = {no_id}/{(no_id*100/node_count):.2f}%, no eng name = {no_eng_name}/{no_eng_name*100/node_count:.2f}%, no desc = {no_desc}/{no_desc*100/node_count:.2f}%,")
print(f"no birth = {no_birth}/{no_birth*100/node_count:.2f}%, no death {no_death}/{no_death*100/node_count:.2f}%")
print(f"no edge = {no_edge}/{no_edge*100/node_count:.2f}%, no edge end = {no_edge_end}/{no_edge_end*100/edge_count:.2f}%")

# Write the node data to the node_output_file
with open(node_output_file, "w", newline="") as f:
    writer = csv.writer(f)
    writer.writerow(["id", "name"])
    writer.writerows(node_data)

# Write the edge data to the edge_output_file
with open(edge_output_file, "w", newline="") as f:
    writer = csv.writer(f)
    writer.writerow(["start_node", "edge_type", "end_node"])
    writer.writerows(edge_data)

with open(desc_output_file, "w", newline="") as f:
    writer = csv.writer(f)
    writer.writerow(["start_node", "edge_type", "end_node"])
    writer.writerows(desc_data)
