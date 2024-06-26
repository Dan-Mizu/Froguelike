class_name Teleporter
extends Interactable

# properties
@export var destination: String

# init properties
func setup(_id: String) -> Teleporter:
	# save ID
	id = _id

	return self

func _ready() -> void:
	#fetch set teleporter's properties
	if id:
		# get type
		if not type:
			type = Cache.data["teleporters"][id]["type"]

		# get texture
		if not texture_key:
			texture_key = Cache.data["interactables"][type]["texture"]

		# get destination
		if not destination:
			destination = Cache.data["teleporters"][id]["destination"]

	super()

# methods
func interact() -> void:
	# save next level to temp cache
	Cache.temp["next_level"] = destination

	# change scene to destination level
	get_tree().change_scene_to_packed(load("res://scenes/level.tscn"))

# hints
func start_interact_hint() -> void:
	hud.update_interact_hint(self, Cache.lang["en_us"]["hud"]["hint"]["teleporter"] + " " + Cache.lang["en_us"]["interactables"]["teleporters"][id])
