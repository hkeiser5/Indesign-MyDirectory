# Indesign-MyDirectory
Indesign script that will create directory listings from a csv file
Instructions on how to use:

Start with an .csv document and make sure each column has a header.
Ensure that you are not using the ~ or / character in your fields, if you are
you should place a space after the character and then do a find replace when done to change back
to how you have it originally. Indesigns change field does not recognize escaped characters.

Your csv must also not contain fields that begin with open ended quotes or contain a right double quote immediately followed by a comma.
ex1: "whoa
ex2: "howdy", she said

Create your paragraph styles, character styles, and grep styles for a single directory listing. Download
the sample directory indd file for how your styles could work.

Select a text box in your indesign document. Apply your paragraph style for your directory to the text box. Run the script. Place fields as needed. Hit OK, then
your directory will create itself.
