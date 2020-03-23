# Adding a new tileset

## Add it to the repo

Copy the file into `/media/gfx/tile`, feel free to make subdirectories if you want to arrange things more nicely.

## Add a texture reference

If your tileset is part of an existing set, open up the texture set file (`/src/texture/whatever.js`). Otherwise, you'll need to ...TODO

## Make it into a material

If your tileset is part of an existing set, you can simply locate the correct material set file (`/src/material/whatever.js`) and add a reference to the

## Add a resource reference

Open up `src/resources.js`. At the top you'll see a big list of imports which tell the code where the resources are; add a line, it'll look something like this: `import resourceNameImg from '../media/gfx/tile/resourcename.png';`.

Once that's done, scroll down to the bottom of the file; this `PreloadResources` function tells the game what to load when it first boots up.

TODO
