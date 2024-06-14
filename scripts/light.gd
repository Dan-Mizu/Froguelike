extends Node2D

# references
@export_category("References")
@onready var player_light: PointLight2D = %"Player Light"
@onready var environment_light: PointLight2D = %"Environment Light"

# properties
@export_category("Properties")
@export var gradient: Gradient
@export var color: Color = Color.WHITE
@export var energy: float = 1.0

func _ready():
	# set properties
	player_light.texture.gradient = gradient
	player_light.color = color
	player_light.energy = energy
	environment_light.texture.gradient = gradient
	environment_light.color = color
	environment_light.energy = energy
