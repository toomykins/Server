# RuneScript

This runtime spec is inspired by Jagex's RuneScript - but without internal knowledge from actually working there, we can only speculate how certain behaviors work. This is especially relevant for NPCs, which have little info available.

## Terminology

Op = Operable (used option next to target)  
Ap = Approachable (used option from a distance)

Loc = Location (objects in world)  
Obj = Object (items)  
Held = Held Object (items in backpack)  

## Triggers

These are engine triggers that the server can execute. Their format is `[name,subject]`. Subject typically refers to a config name.  
Triggers may have multiple matches, only the most specific one is used initially. Scripts can defer to the next script by calling `default();`  
Subject priority is `specififc` > `_category` > `_` (catch-all)

### Player

1-5: expanded to 5 different triggers (to save space on this page)  
1-5 correspond to the options defined in the cache for a given config.

Triggers that end in `t` represent "target spell" scripts. An example may be using telegrab on an object.
Triggers that end in `u` represent "use" scripts, when an object is used on something.

```
[oploc1-5,loc]
[oploct,loc]
[oplocu,loc]
[aploc1-5,loc]
[aploct,loc]
[aplocu,loc]

[opobj1-5,obj]
[opobjt,obj]
[opobju,obj]
[apobj1-5,obj]
[apobjt,obj]
[apobju,obj]

[opnpc1-5,npc]
[opnpct,npc]
[opnpcu,npc]
[apnpc1-5,npc]
[apnpct,npc]
[apnpcu,npc]

[opheld1-5,obj]
[if_button,interface:component]
[if_button1-5,interface:component]

[opplayer1-5,_]
[opplayert,_]
[opplayeru,_]
[applayer1-5,_]
[applayert,_]
[applayeru,_]

[idletimer,_] - intercepts idle timer packet to continue/ignore logout
```

### NPC

ai_queue triggers can be arbitrarily assigned, up to 20 for a single NPC.  
To keep things standardized, `ai_queue1` should be used for retaliation, `ai_queue2` should be used for damage, `ai_queue3` should be used for death, and `ai_queue8` should be used for hold spells (bind etc).

```
[spawn,npc]

[ai_timer,timer_name]

[ai_queue1-20,npc]
```
