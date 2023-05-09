# Player Saves

This save format is in big-endian.

Each offset is relative to its section.

## Header

File length is the length of the file in bytes, including the header and footer. It gets used to verify the file is not truncated.

| Offset | Type | Description |
| --- | --- | --- |
| 0 | Uint16 | Magic number: 0x2004 |
| 2 | Uint32 | File length |
| 6 | Uint8 | Format version |

7 bytes.

## Footer

The index positions are useful to seek-ahead to specific data blocks for external analysis.  
CRC32 is calculated from the header to the end of the file.

| Offset | Type | Description |
| --- | --- | --- |
| 0 | Uint32 | Player variable data index |
| 4 | Uint32 | Inventory data index |
| 8 | Uint32 | CRC32 of file |

12 bytes.

## Format Version 1

Base levels are calculated from stats XP.  
Temp (boosted) levels are taken from current stat levels.

| Offset | Type | Description |
| --- | --- | --- |
| 0 | Uint16 | x position in world |
| 2 | Uint16 | z position in world |
| 4 | Uint8 | World plane |
| 5 | Uint8[7] | Identity kit |
| 12 | Uint8[5] | Identity kit colors |
| 17 | Uint8 | Gender |
| 18 | Uint16 | Run Energy |
| 20 | Uint32 | Ticks logged in |

24 bytes.

### Stats Data

| Offset | Type | Description |
| --- | --- | --- |
| 0 | Uint8 | # of stats |
| x | Uint32 | Stat XP |
| x | Uint8 | Temp level |

21 stats * 5 = 105 bytes.

### Player Variable Data

| Offset | Type | Description |
| --- | --- | --- |
| 0 | Uint16 | # of varps |
| x | Uint16 | Varp ID |
| x | Uint32 | Varp value |

### Inventory Data

| Offset | Type | Description |
| --- | --- | --- |
| 0 | Uint8 | # of invs |
| x | Uint16 | Inv ID |
| x | Uint16 | # of objs |
| y | Uint16 | Obj inv slot |
| y | Uint16 | Obj ID |
| y | Uint32 | Obj amount |

note: Banks can store 400 items, so a full bank results in at least a 4KB inventory block.

### Example of newly registered player

148 bytes:
```
0x2004 - magic
0x00000000 - file length
0x01 - format version

0x0C16 - x position in world (tutorial island)
0x0C22 - z position in world (tutorial island)
0x00 - world plane (tutorial island)
0x00 0x0A 0x12 0x1A 0x21 0x24 0x2A - identity kit
0x00 0x00 0x00 0x00 0x00 - identity kit colors
0x00 - gender
0x2710 - run energy
0x00000000 - ticks logged in

0x15 - # of stats
... [3]
0x00000482 - stat XP
0x0A - temp level
...

0x00 - # of varps

0x00 - # of invs

0x00000000 - player variable index
0x00000000 - inventory data index
0x00000000 - CRC32
```

## Format Version 2

\- not implemented \-

ideas:
- objvars
- extended var types (lookup to BaseVarType), can support long/string
