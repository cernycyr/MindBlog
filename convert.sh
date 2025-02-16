#!/bin/bash

# Requirements:
# pandoc: sudo apt-get install pandoc
# pdflatex: sudo apt-get install texlive-latex-base texlive-latex-recommended

# Check if a file is provided as an argument
if [ -z "$1" ]; then
  echo "Usage: $0 <input-file>"
  exit 1
fi

# Assign the input file to a variable
input_file="$1"

# Check if the input file exists
if [ ! -f "$input_file" ]; then
  echo "File not found: $input_file"
  exit 1
fi

# Define the output file name by replacing the extension with .pdf
output_file="${input_file%.*}.pdf"

# Convert the input file to PDF using Pandoc
pandoc "$input_file" -o "$output_file" -V geometry:margin=1in

# Check if the conversion was successful
if [ $? -eq 0 ]; then
  echo "Conversion successful: $output_file"
else
  echo "Conversion failed"
  exit 1
fi
