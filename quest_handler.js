
// Big things will happen here.

/*  List of possible quests

Generic:

Get X kills
Get X assists



Specific:

Place X unit_name

Kill X flying units
Kill X armored units
Kill X support units
Kil X ranged units
Kill X epic units

Get X assists from buffing
Get X assists from healing
Get X assists from tanking

*/

can_kill_easily = ["assassins", "ranged", "melee"]
can_assist_easily = ["support"]
can_kill_epic = ["epic_units", "buster", "epic_balloon_buster"] // Epic rogue? This is mostly a gamble as it depends on the enemy epic unit class, but certain units will actively hunt epic units.
can_kill_flying = ["flying_rogue", "ranged", "vampire", "lancer", "balloon_buster"]
can_kill_armored = ["buster", "melee"]
can_kill_ranged = ["assassins", "armored"] //Armored doesn't necessarily kill, but is capable of tanking the damage and if close enough get the kill.
can_kill_support = ["assassins"]

can_buff = ["flag_bearer", "saint"]
can_heal = ["healer", "monk", "templar", "fairy"]
can_tank = ["armored"]