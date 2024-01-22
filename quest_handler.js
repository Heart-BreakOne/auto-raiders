
// Big things will happen here.

/*  List of possible quests

Generic:

Get X kills
Get X assists
Purchase X Scrolls in the Store
Earn X currency
Place X Units
Win X battles (no duels, no dungeons)
"Earn X Epic Potions"
Earn X Event Tokens
Follow X Captain Battle Plans
Fulfill X Battle Commands
Place the correct Units over your Captain's Battle commands

Specific:

Place X unit_name

Kill X flying units
Kill X armored units
Kill X support units
Kil X ranged units
Kill X epic units

Get X assists from buffing
Earn X Assists from Buffing
Earning X Assists from Buffing

Get X assists from healing
Earn X Assists from Healing
Earning X Assists from Healing

Get X assists from tanking
Earn X Assists from Tanking

Get X Assists with Armored Units


Others
Equip a Skin to one of your Units
Help take down X Tabletop Units
Kill 1 event Unit
Destroy X something
Take down X something
Follow battle plans


*/
// Assassins will kill anything, but they will prioritize specific unit types over the units that are closer.
can_kill_easily = ["assassins", "ranged", "melee"]
can_assist_easily = ["flag_bearer", "support"]
can_kill_epic = ["epic_units", "buster", "epic_balloon_buster"] // Epic rogue? This is mostly a gamble as it depends on the enemy epic unit class, but certain units will actively hunt epic units.
can_kill_flying = ["epic_units", "flying_rogue", "ranged", "vampire", "lancer", "balloon_buster"]
can_kill_armored = ["buster", "melee"]
can_kill_ranged = ["assassins", "armored"] //Armored doesn't necessarily kill, but is capable of tanking the damage and if close enough get the kill.
can_kill_support = ["assassins"]

can_buff = ["flag_bearer", "saint"]
can_heal = ["healer", "monk", "templar", "fairy"]
can_tank = ["armored"]