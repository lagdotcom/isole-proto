/*
MAP LEGEND:
- SKULL - Normal enemy room, a few waves of enemies
- THREE SKULLS - Many waves of enemies, chance to drop item
- SKULL WITH HORNS - Miniboss, guaranteed item drop
- BIG HUGE SKULL - Floor boss, always the final node
- MONEY SACK - Stallonio's Store
- OLD SIGNPOST - Secret hint or useless information
- CAMPFIRE - Event chance, positive or negative (can heal, find an item, encounter an enemy group, sleep and be robbed, etc.)
- HOURGLASS - Timed challenge, survive a challenging onslaught until time runs out
- SILVER LOCK - Locked path, requires a key
- GOLD LOCK - Locked path, requires 3 keys
- SILVER HEART LOCK - Locked path, requires giving up a heart to open
- GOLD HEART LOCK - Locked path, requires giving up 3 hearts to open
- SILVER TREASURE CHEST - Gives a small reward
- GOLD TREASURE CHEST - Gives a large reward
- ? - Mystery, can be any of the above rooms except floor boss
- COLOR SPHERE - A lost dream of Kurtelli (secret item room)
- DARK SPHERE - Visions of the Blot (secret challenge room, difficult waves of enemies or bosses)
- UPSIDE DOWN ICONS - Something is wrong...
*/
export enum NodeType {
	Skull,
	ThreeSkulls,
	HornedSkull,
	MoneySack,
	Signpost,
	Campfire,
	Hourglass,
	SilverLock,
	GoldLock,
	SilverHeartLock,
	GoldHeartLock,
	SilverChest,
	GoldChest,
	Unknown,
	ColourSphere,
	DarkSphere,
	Boss,
	Indeterminate,
}

export default interface MapNode {
	id: number;
	connections: number[];
	stage: number;
	hidden?: boolean;
	type: NodeType;
	visited?: boolean;
	x: number;
	y: number;
}
