class_name Lootable
extends Interactable

# properties
@export var sounds: Dictionary
@export var loot: String

# init properties
func setup(_id: String) -> Lootable:
	# save ID
	id = _id

	return self

func _ready() -> void:
	# fetch set lootable's properties
	if id:
		# get type
		if not type:
			type = Cache.data["lootables"][id]["type"]

		# get texture
		if not texture_key:
			texture_key = Cache.data["interactables"][type]["texture"]

		# get sounds
		if not sounds:
			sounds = Cache.data["interactables"][type]["sounds"]

		# get loot
		if not loot:
			loot = Cache.data["lootables"][id]["loot"]

	super()

# hints
func start_interact_hint() -> void:
	hud.update_interact_hint(self, Cache.lang["en_us"]["hud"]["hint"]["lootable"] + " " + Cache.lang["en_us"]["interactables"]["lootables"][id])
