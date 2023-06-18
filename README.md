# 2004scape Server

[Website](https://2004scape.org) | [Discord](https://discord.gg/hN3tHUmZEN) | [Rune-Server](https://www.rune-server.ee/runescape-development/rs2-server/projects/701698-lost-city-225-emulation.html)

**disclaimer: All server code has been written from scratch for this project, Jagex has never had any source code leaks.**

**status: in-development, not ready for players**. Contributors are welcome to help out.

---

This project aims to replicate an authentic RuneScape experience from May 2004. It should be considered an emulator first and foremost, as replicating behaviors by emulating the underlying systems is the biggest focus. The config system and scripting system is as close to authentic as we understand it, and is continually refined as we learn more info.

---

*To Jagex*: This project comes out of love for the game. As MMOs age, their previous versions are lost to history. An experience becomes ephemeral and time-limited. We're aware that you have no backups for this era and so we're putting in the effort to recreate what we can.  
It won't ever profit off your trademarks. Without this project, this version of the game only lives in our memories. Screenshots and videos are scarce, and the original data is lost to time. This is no easy task.

*To players*: So happy to have you interested! RuneScape 2 launched on March 29, 2004. We have no copies of that revision, but we do have some client caches from May 2004. This project emulates *May 18, 2004*, which was live until June 1 of that year. It has Treasure Trails and Big Chompy Bird Hunting. The next revision after this added Elemental Workshop I.

## Developer Dependencies

- [NodeJS 16+](https://nodejs.org/en)
- [Java 8+](https://adoptium.net/)

Java is required for 1:1 CRC matching during compression ([JagCompress](https://github.com/2004scape/JagCompress)). Maybe that can be rewritten in pure JS eventually.

## Cache Workflow Status

These jagfiles have been unpacked, decoded, and can be recreated 1:1 (pre- and post- compression!): `config`, `models`, `sounds`, and `wordenc`.

Some more types of data are not packed in jagfiles but still get sent to the client when playing. These produce 1:1 matches pre- and post- compression as well: `maps`, `jingles`*, and `songs`.  
\* jingles not saved on client

`media`, `textures`, and `title` will not produce identical jagfiles but are visually identical in-game.  
This is due to a few reasons. Pixel encoding order calculation (picking column-major or row-major), auto-cropping (using their values currently), and adding empty trailing sprites in spritesheets.  
I attempted the pixel encoding order problem but I can't get it to produce identical decisions. I haven't bothered with the other two without having that one solved.  
It would also be nice to figure out how to handle color quantization, Jagex has the ability to limit sprites to a max # of colors automatically this way. Not necessary to improve the output here.

See the docs folder for more info on our file formats.
