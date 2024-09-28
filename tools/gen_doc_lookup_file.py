import json
import os
import urllib.request
from pathlib import Path

from sphinx.util.inventory import InventoryFile

import kalong.utils.doc_lookup

uris = ["https://docs.python.org/"]
out = Path(kalong.utils.doc_lookup.__file__).parent / "lookup.json"
lookup = {}

for uri in uris:
    f = urllib.request.urlopen(os.path.join(uri, "objects.inv"))
    invdata = InventoryFile.load(f, uri, os.path.join)
    for category, data in invdata.items():
        domain, name = category.split(":")
        if domain != "py":
            continue
        for attr, (_, _, link, _) in data.items():
            if attr in lookup:
                print(f"Dup {attr} in {category}")
            lookup[attr] = link


with open(out, "w") as f:
    json.dump(lookup, f, indent=2)
