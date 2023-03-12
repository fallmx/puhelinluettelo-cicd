#!/bin/bash

response=$(curl -s "http://localhost:8080/health")

if [ -z $response ]
then
  echo "no response"
  exit 1
fi

if [ $response = "ok" ]
then
  echo "ok"
  exit 0
fi

echo "incorrect response"
exit 1
