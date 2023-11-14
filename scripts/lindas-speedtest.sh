#!/bin/bash

# Number of iterations
iterations=5

# Initialize total times
total_speed_download=0
total_time_appconnect=0
total_time_connect=0
total_time_namelookup=0
total_time_pretransfer=0
total_time_redirect=0
total_time_starttransfer=0
total_time_total=0

echo "----"

# Loop for the specified number of iterations
for ((i=1; i<=iterations; i++)); do
  # Use curl to measure times and extract the times in seconds
  read -r speed_download time_appconnect time_connect time_namelookup time_pretransfer time_redirect time_starttransfer time_total < <(curl https://test.visualize.admin.ch/api/graphql \
  -k --resolve test.visualize.admin.ch:443:193.246.94.41 \
  -X POST \
  -H 'content-type: application/json' \
  -H 'x-visualize-cache-control: no-cache' \
  -H 'Pragma: no-cache' \
  -H 'Cache-Control: no-cache' \
  --data-raw '{"query":"query PossibleFilters($iri: String!, $sourceType: String!, $sourceUrl: String!, $filters: Filters!) {\n  possibleFilters(\n    iri: $iri\n    sourceType: $sourceType\n    sourceUrl: $sourceUrl\n    filters: $filters\n  ) {\n    iri\n    type\n    value\n    __typename\n  }\n}\n","operationName":"PossibleFilters","variables":{"iri":"https://environment.ld.admin.ch/foen/nfi/nfi_C-90/cube/2023-3","sourceType":"sparql","sourceUrl":"https://lindas.admin.ch/query","filters":{"https://environment.ld.admin.ch/foen/nfi/unitOfReference":{"type":"single","value":"https://ld.admin.ch/canton/23"},"https://environment.ld.admin.ch/foen/nfi/classificationUnit":{"type":"single","value":"https://environment.ld.admin.ch/foen/nfi/ClassificationUnit/Total"},"https://environment.ld.admin.ch/foen/nfi/inventory":{"type":"single","value":"https://environment.ld.admin.ch/foen/nfi/Inventory/150"},"https://environment.ld.admin.ch/foen/nfi/unitOfEvaluation":{"type":"single","value":"https://environment.ld.admin.ch/foen/nfi/UnitOfEvaluation/2382"},"https://environment.ld.admin.ch/foen/nfi/evaluationType":{"type":"single","value":"https://environment.ld.admin.ch/foen/nfi/EvaluationType/1"}},"filterKey":"https://environment.ld.admin.ch/foen/nfi/unitOfReference, https://environment.ld.admin.ch/foen/nfi/classificationUnit, https://environment.ld.admin.ch/foen/nfi/inventory, https://environment.ld.admin.ch/foen/nfi/unitOfEvaluation, https://environment.ld.admin.ch/foen/nfi/evaluationType"}}' \
  -s -o /dev/null \
  -w '%{speed_download} %{time_appconnect} %{time_connect} %{time_namelookup} %{time_pretransfer} %{time_redirect} %{time_starttransfer} %{time_total}\n')

  # Add the current times to the totals
  total_speed_download=$(echo "$total_speed_download + $speed_download" | bc)
  total_time_appconnect=$(echo "$total_time_appconnect + $time_appconnect" | bc)
  total_time_connect=$(echo "$total_time_connect + $time_connect" | bc)
  total_time_namelookup=$(echo "$total_time_namelookup + $time_namelookup" | bc)
  total_time_pretransfer=$(echo "$total_time_pretransfer + $time_pretransfer" | bc)
  total_time_redirect=$(echo "$total_time_redirect + $time_redirect" | bc)
  total_time_starttransfer=$(echo "$total_time_starttransfer + $time_starttransfer" | bc)
  total_time_total=$(echo "$total_time_total + $time_total" | bc)

  # Print the current iteration and times
  echo "Iteration $i – Total Time: $time_total s, TCP Connect: $time_connect s, 1st Byte: $time_starttransfer s"

  # Add a 2-second break between iterations
  sleep 2
done

# Calculate the averages
avg_speed_download=$(echo "scale=3; $total_speed_download / $iterations" | bc)
avg_time_appconnect=$(echo "scale=3; $total_time_appconnect / $iterations" | bc)
avg_time_connect=$(echo "scale=3; $total_time_connect / $iterations" | bc)
avg_time_namelookup=$(echo "scale=3; $total_time_namelookup / $iterations" | bc)
avg_time_pretransfer=$(echo "scale=3; $total_time_pretransfer / $iterations" | bc)
avg_time_redirect=$(echo "scale=3; $total_time_redirect / $iterations" | bc)
avg_time_starttransfer=$(echo "scale=3; $total_time_starttransfer / $iterations" | bc)
avg_time_total=$(echo "scale=3; $total_time_total / $iterations" | bc)
echo

# Print the averages
echo "Averages"
echo "----"
echo "Avg Download Speed: $avg_speed_download Bytes/s"
echo "Avg Handshake: $avg_time_appconnect s"
echo "Avg TCP Connect: $avg_time_connect s"
echo "Avg DNS Lookup: $avg_time_namelookup s"
echo "Avg Pre-Transfer: $avg_time_pretransfer s"
echo "Avg Redirect: $avg_time_redirect s"
echo "Avg Start Transfer/1st Byte: $avg_time_starttransfer s"
echo "Avg Total Time: $avg_time_total s"
echo "----"


# Single query
# curl https://test.visualize.admin.ch/api/graphql \
# -k --resolve test.visualize.admin.ch:443:193.246.94.41 \
# -X POST \
# -H 'content-type: application/json' \
# -H 'x-visualize-cache-control: no-cache' \
# -H 'Pragma: no-cache' \
# -H 'Cache-Control: no-cache' \
# --data-raw '{"query":"query PossibleFilters($iri: String!, $sourceType: String!, $sourceUrl: String!, $filters: Filters!) {\n  possibleFilters(\n    iri: $iri\n    sourceType: $sourceType\n    sourceUrl: $sourceUrl\n    filters: $filters\n  ) {\n    iri\n    type\n    value\n    __typename\n  }\n}\n","operationName":"PossibleFilters","variables":{"iri":"https://environment.ld.admin.ch/foen/nfi/nfi_C-90/cube/2023-3","sourceType":"sparql","sourceUrl":"https://lindas.admin.ch/query","filters":{"https://environment.ld.admin.ch/foen/nfi/unitOfReference":{"type":"single","value":"https://ld.admin.ch/canton/23"},"https://environment.ld.admin.ch/foen/nfi/classificationUnit":{"type":"single","value":"https://environment.ld.admin.ch/foen/nfi/ClassificationUnit/Total"},"https://environment.ld.admin.ch/foen/nfi/inventory":{"type":"single","value":"https://environment.ld.admin.ch/foen/nfi/Inventory/150"},"https://environment.ld.admin.ch/foen/nfi/unitOfEvaluation":{"type":"single","value":"https://environment.ld.admin.ch/foen/nfi/UnitOfEvaluation/2382"},"https://environment.ld.admin.ch/foen/nfi/evaluationType":{"type":"single","value":"https://environment.ld.admin.ch/foen/nfi/EvaluationType/1"}},"filterKey":"https://environment.ld.admin.ch/foen/nfi/unitOfReference, https://environment.ld.admin.ch/foen/nfi/classificationUnit, https://environment.ld.admin.ch/foen/nfi/inventory, https://environment.ld.admin.ch/foen/nfi/unitOfEvaluation, https://environment.ld.admin.ch/foen/nfi/evaluationType"}}' \
# -s -o /dev/null \
# -w 'Total Time: %{time_total}s\nTime (Handshake): %{time_appconnect}s\nTime (Connect): %{time_connect}s\nTime (Lookup): %{time_namelookup}s\nTime (Pre-Transfer): %{time_pretransfer}s\nTime (Redirect): %{time_redirect}s\nTime (Start-Transfer): %{time_starttransfer}s\nDownload Speed: %{speed_download}\nDownload Size: %{size_download}\n'

# Trace query
# curl https://test.visualize.admin.ch/api/graphql \
# -k --resolve test.visualize.admin.ch:443:193.246.94.41 \
# -X POST \
# -H 'content-type: application/json' \
# -H 'x-visualize-cache-control: no-cache' \
# -H 'Pragma: no-cache' \
# -H 'Cache-Control: no-cache' \
# --data-raw '{"query":"query PossibleFilters($iri: String!, $sourceType: String!, $sourceUrl: String!, $filters: Filters!) {\n  possibleFilters(\n    iri: $iri\n    sourceType: $sourceType\n    sourceUrl: $sourceUrl\n    filters: $filters\n  ) {\n    iri\n    type\n    value\n    __typename\n  }\n}\n","operationName":"PossibleFilters","variables":{"iri":"https://environment.ld.admin.ch/foen/nfi/nfi_C-90/cube/2023-3","sourceType":"sparql","sourceUrl":"https://lindas.admin.ch/query","filters":{"https://environment.ld.admin.ch/foen/nfi/unitOfReference":{"type":"single","value":"https://ld.admin.ch/canton/23"},"https://environment.ld.admin.ch/foen/nfi/classificationUnit":{"type":"single","value":"https://environment.ld.admin.ch/foen/nfi/ClassificationUnit/Total"},"https://environment.ld.admin.ch/foen/nfi/inventory":{"type":"single","value":"https://environment.ld.admin.ch/foen/nfi/Inventory/150"},"https://environment.ld.admin.ch/foen/nfi/unitOfEvaluation":{"type":"single","value":"https://environment.ld.admin.ch/foen/nfi/UnitOfEvaluation/2382"},"https://environment.ld.admin.ch/foen/nfi/evaluationType":{"type":"single","value":"https://environment.ld.admin.ch/foen/nfi/EvaluationType/1"}},"filterKey":"https://environment.ld.admin.ch/foen/nfi/unitOfReference, https://environment.ld.admin.ch/foen/nfi/classificationUnit, https://environment.ld.admin.ch/foen/nfi/inventory, https://environment.ld.admin.ch/foen/nfi/unitOfEvaluation, https://environment.ld.admin.ch/foen/nfi/evaluationType"}}' \
# -v --trace-time
