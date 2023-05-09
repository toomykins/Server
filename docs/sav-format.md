# Player Saves

This save format is in big-endian.

## Header

| Offset | Type | Description |
| --- | --- | --- |
| 0 | Uint16 | Magic number: 0x2004 |
| 2 | Uint16 | Format Version |
| 4 | Uint32 | CRC32 of following data |

## Format Version 1

*(offsets are relative to section start)*

### Account Data

| Offset | Type | Description |
| --- | --- | --- |
| 0 | Uint64 | Base37 username |
| 8 | Uint8[60] | BCrypt2 hash of password |
| 68 | String | Email address |
| x | Uint64 | Date registered |

### Login History Data

We only maintain a list of the last 10 logins for rate limiting and moderation purposes.

| Offset | Type | Description |
| --- | --- | --- |
| 0 | Uint8 | # of logins (loop) |
| x | Uint32 | Login IPv4 x |
| x | Uint64 | Login Timestamp x |

### Recovery Data

Up to 3 recovery questions can be set.

| Offset | Type | Description |
| --- | --- | --- |
| 0 | Uint8 | # of recovery questions (loop) |
| x | String | Recovery question x |
| x | String | Recovery answer x |

### Account Center Data

| Offset | Type | Description |
| --- | --- | --- |
| 0 | Uint8 | # of messages |
| x | Uint8 | Message type |
| x | String | Message text |
| x | Uint64 | Message timestamp |

### Player Data

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
| 20 | Uint32[19] | Stats XP |
| 96 | Uint8[19] | Current stat levels |

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
| y | Uint8 | # of obj vars |
| z | Uint16 | Obj var ID |
| z | Uint32 | Obj var value |

note: Banks can store 400 items, so a full bank results in at least a 4KB inventory block.

Run weight and equipment bonuses are calculated from the `worn` inventory data.

### Example of newly registered player

```
0x2004 - magic
0x0001 - format version
... crc ...
... username ...
... password ...
... email ...
... date registered ...
0x00 - # of logins
0x00 - # of recovery questions
0x00 - # of messages
0x0C16 - x position in world (tutorial island)
0x0C22 - z position in world (tutorial island)
0x00 - world plane (tutorial island)
0x00 0x0A 0x12 0x1A 0x21 0x24 0x2A - identity kit
0x00 0x00 0x00 0x00 0x00 - identity kit colors
0x00 - gender
0x2710 - run energy
... [3] 0x00000482 ... - stats xp
0x01 ... [3] 0x0A ... - current stat levels
0x00 - # of varps
0x00 - # of invs
```
