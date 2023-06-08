**all boolean values are yes/no instead of true/false.**

## Floor

Overlay/underlay colors and textures. Underlays do not support textures.

extension: flo

| Config | Description | Values |
|-|-|-|
| rgb | Color to display on a tile | RGB hex color code |
| texture | Texture to display on a tile | Name of texture under src/binary/textures/ |
| overlay | Type to display in editor (unused) | Boolean |
| occlude | | Boolean |
| editname | Name to display in editor (unused) | String |

## Identity Kit

Player body parts.

extension: idk

| Config | Description | Values |
|-|-|-|
| type | Bodypart type | man_, woman_ followed by: hair, jaw, torso, arms, hands, legs |
| model(n) | Set a model for index n | Model |
| disable | Prevent the player from selecting this in the design interface | Boolean |
| recol(n)s | Source color | RS2 HSL |
| recol(n)d | Destination color | RS2 HSL |
| head(n) | Set a chathead model for index n | Model |

## Location

3D objects in the world.

extension: loc

| Config | Description | Values |
|-|-|-|
| model | Sets the world model | Model |
| name | Sets the display name | String |
| desc | Sets the examine text | String |
| width | Sets the length of this config in tiles | 1 to 255 |
| length | Sets the width of this config in tiles | 1 to 255 |
| blockwalk | Blocks line of walk checks | Boolean |
| blockrange | Blocks line of sight checks | Boolean |
| active | Overrides if an object can be interacted/examined regardless of its type/options | Boolean |
| hillskew | Adjust model to fit terrain| Boolean |
| sharelight | Share vertex lighting with nearby connected models| Boolean |
| occlude | | Boolean |
| anim | Default animation to loop | Sequence |
| hasalpha | Prevent client from caching alpha frames | Boolean |
| walloff | | 0-255 |
| ambient | Lighting parameter | -128 to 127 |
| contrast | Lighting parameter | -128 to 127 |
| op(n) | Interaction option | String, or "hidden" to hide from the client so the server can trigger it in a script |
| recol(n)s | Source color | RS2 HSL |
| recol(n)d | Destination color | RS2 HSL |
| mapfunction | Minimap icon (shops, banks, etc) | Sprite tile index inside src/sprites/mapfunction.png |
| mirror | Flip object | Boolean |
| shadow | Calculate shadowmap | Boolean |
| resizex | | 0-65535 |
| resizey | | 0-65535 |
| resizez | | 0-65535 |
| mapscene | Minimap icon (trees, rocks, etc) | Sprite tile index inside src/sprites/mapscene.png |
| forceapproach | Pathfinder hint | north, east, south, west |
| xoff | | -32768 to 32767 |
| yoff | | -32768 to 32767 |
| zoff | | -32768 to 32767 |
| forcedecor | | Boolean |
| param | Parameter for scripts | key=value |

## NPC

Non-playable characters in the world.

extension: npc

| Config | Description | Values |
|-|-|-|
| model(n) | Set a model for index n | Model |
| name | Sets the display name | String |
| desc | Sets the examine text | String |
| size | NPC size in tiles: n*n | 1-255 |
| readyanim | Idle animation | Sequence |
| walkanim | Walking animation | Sequence |
| walkanim_b | Turn around animation | Sequence |
| walkanim_r | Right turn animation | Sequence |
| walkanim_l | Left turn animation | Sequence |
| hasalpha | Prevent client from caching alpha frames | Boolean |
| op(n) | Interaction option | String, or "hidden" to hide from the client so the server can trigger it in a script |
| recol(n)s | Source color | RS2 HSL |
| recol(n)d | Destination color | RS2 HSL |
| head(n) | Set a chathead model for index n | Model |
| code90 | | 0 to 65535 |
| code91 | | 0 to 65535 |
| code92 | | 0 to 65535 |
| visonmap | Override mapdot visibility on minimap | Boolean |
| vislevel | Visible combat level | 1 to 65535, "hide" / 0 |
| resizeh | Resize horizontally (x) | 0 to 65535 |
| resizev | Resize vertically (y) | 0 to 65535 |
| param | Parameter for scripts | key=value |

## Objects

Items.

extension: obj

| Config | Description | Values |
|-|-|-|
| model(n) | Set a visible model for index n | Model |
| name | Sets the display name | String |
| desc | Sets the examine text | String |
| 2dzoom | 2d zoom for icon | 0 to 65535 |
| 2dxan | 2d x angle for icon | 0 to 65535 |
| 2dyan | 2d y angle for icon | 0 to 65535 |
| 2dzan | 2d z angle for icon | 0 to 65535 |
| 2dxof | 2d x offset for icon | -32767 to 32768 |
| 2dyof | 2d y offset for icon | -32767 to 32768 |
| code9 | | Boolean |
| code10 | | Sequence |
| stackable | If this item should stack | Boolean |
| cost | Item value in shops | 0 to 2,147,483,647 |
| member | Indicates if this is a members-only item | Boolean |
| manwear | Male model slot when equipped | Model |
| manwear2 | Secondary model slot when equipped | Model |
| manwear3 | Tertiary model slot when equipped | Model |
| manhead | Male chathead slot when equipped | Model |
| manhead2 | Secondary chathead slot when equipped | Model |
| womanwear | Female model slot when equipped | Model |
| womanwear2 | Secondary model slot when equipped | Model |
| womanwear3 | Tertiary model slot when equipped | Model |
| womanhead | Female chathead slot when equipped | Model |
| womanhead2 | Secondary chathead slot when equipped | Model |
| op(n) | Ground interaction option | String |
| iop(n) | Interface interaction option | String |
| recol(n)s | Source color | RS2 HSL |
| recol(n)d | Destination color | RS2 HSL |
| certlink | Linked object to inherit and draw | Object |
| certtemplate | Template object to draw behind model (noted paper) | Object |
| count | Templates to replace this item's properties with if above a certain amount | Object, followed by Amount (0 to 65535) |
| weight | Weight of item in a given unit, converts to grams internally | Grams (g), Kilograms (kg), Ounces (oz), and Pounds (lb) |
| wearpos | Slot to equip into or override | hat, back, front, righthand, body, lefthand, arms, legs, head, hands, feet, jaw, ring, quiver |
| wearpos2 | Slot to equip into or override | hat, back, front, righthand, body, lefthand, arms, legs, head, hands, feet, jaw, ring, quiver |
| wearpos3 | Slot to equip into or override | hat, back, front, righthand, body, lefthand, arms, legs, head, hands, feet, jaw, ring, quiver |
| param | Parameter for scripts | key=value |

## Sequence

Sequences of animation frames to play.

extension: seq

| Config | Description | Values |
|-|-|-|
| frame(n) | Frames to play | |
| iframe(n) | Frames to play on interfaces (chatheads) | |
| delay(n) | | |
| replayoff | | |
| walkmerge | | |
| stretches | | Boolean |
| priority | | |
| mainhand | Override mainhand (righthand) appearance | obj name or "hide" |
| offhand | Override offhand (lefthand) appearance | obj name or "hide" |
| replaycount | | |

## Spotanim

Graphical animated effects intended to play in a spot in the world.

extension: spotanim

| Config | Description | Values |
|-|-|-|
| model | Sets the world model | Model |
| anim | Default animation to loop | Sequence |
| hasalpha | Prevent client from caching alpha frames | Boolean |
| resizeh | Resize horizontally (x) | 0 to 65535 |
| resizev | Resize vertically (y) | 0 to 65535 |
| orientation | Degrees to rotate | 0 to 360 |
| ambient | Lighting parameter | -128 to 127 |
| contrast | Lighting parameter | -128 to 127 |
| recol(n)s | Source color | RS2 HSL |
| recol(n)d | Destination color | RS2 HSL |

## Player Variable

Variables stored on the player, used for client interfaces, quest progression, or inside scripts.

extension: varp

| Config | Description | Values |
|-|-|-|
| code1 | | |
| code2 | | |
| code3 | | |
| code4 | | |
| clientcode | Link to hardcoded variable in client | 1 to 8 |
| code6 | | |
| code7 | | |
| code8 | | |
| code10 | | |
| transmit | How frequently to transmit changes | never, always |
