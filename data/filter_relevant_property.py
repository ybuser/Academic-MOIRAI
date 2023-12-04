import os
import json

def filter_relevant_property(file_path, relevant_properties, output_dir):
    # Create a new directory for the output files
    os.makedirs(output_dir, exist_ok=True)

    # Read the input JSON file
    with open(file_path, 'r') as f:
        data = json.load(f)

    # Loop through each entity in the JSON file
    for entity_id, entity_data in data['entities'].items():
        # Loop through each claim for the entity
        # for property_id, claims in entity_data['claims'].items():
        #     # Check if the property ID is in the list of relevant properties
        #     if property_id not in relevant_properties:
        #         # If not, delete the claim
        #         entity_data['claims'].pop(property_id, None)
        updated_claims = {
            prop_id: prop_data for prop_id, prop_data in entity_data['claims'].items()
            if prop_id in relevant_properties
        }
    
    # Update the entity data with the modified claims
    entity_data['claims'] = updated_claims

    # Write the modified JSON to a new file in the output directory
    output_file_path = os.path.join(output_dir, os.path.basename(file_path))
    with open(output_file_path, 'w') as f:
        json.dump(data, f)

# Example usage
relevant_properties = ['P569', 'P570', 'P2348', 'P69', 'P27', 'P551', 'P106', 'P2959', 'P101', 'P135', 'P185', 'P802', 'P1066', 'P737', 'P800']

input_dir = 'json_files'
output_dir = 'shorter_json_files'
for file_name in os.listdir(input_dir):
    if file_name.startswith('Q') and file_name.endswith('.json'):
        file_path = os.path.join(input_dir, file_name)
        filter_relevant_property(file_path, relevant_properties, output_dir)
