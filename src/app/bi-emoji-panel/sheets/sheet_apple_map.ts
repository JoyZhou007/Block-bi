export function EmojiPickerAppleSheetLocator(label: string) {
  if (!SHEET_APPLE_MAP_OBJECT[label]) {
    return { x : 0, y : 0 };
  }

  return {
    x: SHEET_APPLE_MAP_OBJECT[label][0],
    y: SHEET_APPLE_MAP_OBJECT[label][1]
  }
};

const SHEET_APPLE_MAP_OBJECT = {
  "100": [
    17,
    32
  ],
  "1234": [
    19,
    48
  ],
  "copyright": [
    0,
    0
  ],
  "registered": [
    0,
    1
  ],
  "bangbang": [
    0,
    2
  ],
  "interrobang": [
    0,
    3
  ],
  "tm": [
    0,
    4
  ],
  "information_source": [
    0,
    5
  ],
  "left_right_arrow": [
    0,
    6
  ],
  "arrow_up_down": [
    0,
    7
  ],
  "arrow_upper_left": [
    0,
    8
  ],
  "arrow_upper_right": [
    0,
    9
  ],
  "arrow_lower_right": [
    0,
    10
  ],
  "arrow_lower_left": [
    0,
    11
  ],
  "leftwards_arrow_with_hook": [
    0,
    12
  ],
  "arrow_right_hook": [
    0,
    13
  ],
  "watch": [
    0,
    14
  ],
  "hourglass": [
    0,
    15
  ],
  "keyboard": [
    0,
    16
  ],
  "eject": [
    0,
    17
  ],
  "fast_forward": [
    0,
    18
  ],
  "rewind": [
    0,
    19
  ],
  "arrow_double_up": [
    0,
    20
  ],
  "arrow_double_down": [
    0,
    21
  ],
  "black_right_pointing_double_triangle_with_vertical_bar": [
    0,
    22
  ],
  "black_left_pointing_double_triangle_with_vertical_bar": [
    0,
    23
  ],
  "black_right_pointing_triangle_with_double_vertical_bar": [
    0,
    24
  ],
  "alarm_clock": [
    0,
    25
  ],
  "stopwatch": [
    0,
    26
  ],
  "timer_clock": [
    0,
    27
  ],
  "hourglass_flowing_sand": [
    0,
    28
  ],
  "double_vertical_bar": [
    0,
    29
  ],
  "black_square_for_stop": [
    0,
    30
  ],
  "black_circle_for_record": [
    0,
    31
  ],
  "m": [
    0,
    32
  ],
  "black_small_square": [
    0,
    33
  ],
  "white_small_square": [
    0,
    34
  ],
  "arrow_forward": [
    0,
    35
  ],
  "arrow_backward": [
    0,
    36
  ],
  "white_medium_square": [
    0,
    37
  ],
  "black_medium_square": [
    0,
    38
  ],
  "white_medium_small_square": [
    0,
    39
  ],
  "black_medium_small_square": [
    0,
    40
  ],
  "sunny": [
    0,
    41
  ],
  "cloud": [
    0,
    42
  ],
  "umbrella": [
    0,
    43
  ],
  "snowman": [
    0,
    44
  ],
  "comet": [
    0,
    45
  ],
  "phone": [
    0,
    46
  ],
  "ballot_box_with_check": [
    0,
    47
  ],
  "umbrella_with_rain_drops": [
    0,
    48
  ],
  "coffee": [
    1,
    0
  ],
  "shamrock": [
    1,
    1
  ],
  "point_up": [
    1,
    2
  ],
  "skull_and_crossbones": [
    1,
    8
  ],
  "radioactive_sign": [
    1,
    9
  ],
  "biohazard_sign": [
    1,
    10
  ],
  "orthodox_cross": [
    1,
    11
  ],
  "star_and_crescent": [
    1,
    12
  ],
  "peace_symbol": [
    1,
    13
  ],
  "yin_yang": [
    1,
    14
  ],
  "wheel_of_dharma": [
    1,
    15
  ],
  "white_frowning_face": [
    1,
    16
  ],
  "relaxed": [
    1,
    17
  ],
  "female_sign": [
    1,
    18
  ],
  "male_sign": [
    1,
    19
  ],
  "aries": [
    1,
    20
  ],
  "taurus": [
    1,
    21
  ],
  "gemini": [
    1,
    22
  ],
  "cancer": [
    1,
    23
  ],
  "leo": [
    1,
    24
  ],
  "virgo": [
    1,
    25
  ],
  "libra": [
    1,
    26
  ],
  "scorpius": [
    1,
    27
  ],
  "sagittarius": [
    1,
    28
  ],
  "capricorn": [
    1,
    29
  ],
  "aquarius": [
    1,
    30
  ],
  "pisces": [
    1,
    31
  ],
  "spades": [
    1,
    32
  ],
  "clubs": [
    1,
    33
  ],
  "hearts": [
    1,
    34
  ],
  "diamonds": [
    1,
    35
  ],
  "hotsprings": [
    1,
    36
  ],
  "recycle": [
    1,
    37
  ],
  "wheelchair": [
    1,
    38
  ],
  "hammer_and_pick": [
    1,
    39
  ],
  "anchor": [
    1,
    40
  ],
  "crossed_swords": [
    1,
    41
  ],
  "staff_of_aesculapius": [
    1,
    42
  ],
  "scales": [
    1,
    43
  ],
  "alembic": [
    1,
    44
  ],
  "gear": [
    1,
    45
  ],
  "atom_symbol": [
    1,
    46
  ],
  "fleur_de_lis": [
    1,
    47
  ],
  "warning": [
    1,
    48
  ],
  "zap": [
    2,
    0
  ],
  "white_circle": [
    2,
    1
  ],
  "black_circle": [
    2,
    2
  ],
  "coffin": [
    2,
    3
  ],
  "funeral_urn": [
    2,
    4
  ],
  "soccer": [
    2,
    5
  ],
  "baseball": [
    2,
    6
  ],
  "snowman_without_snow": [
    2,
    7
  ],
  "partly_sunny": [
    2,
    8
  ],
  "thunder_cloud_and_rain": [
    2,
    9
  ],
  "ophiuchus": [
    2,
    10
  ],
  "pick": [
    2,
    11
  ],
  "helmet_with_white_cross": [
    2,
    12
  ],
  "chains": [
    2,
    13
  ],
  "no_entry": [
    2,
    14
  ],
  "shinto_shrine": [
    2,
    15
  ],
  "church": [
    2,
    16
  ],
  "mountain": [
    2,
    17
  ],
  "umbrella_on_ground": [
    2,
    18
  ],
  "fountain": [
    2,
    19
  ],
  "golf": [
    2,
    20
  ],
  "ferry": [
    2,
    21
  ],
  "boat": [
    2,
    22
  ],
  "skier": [
    2,
    23
  ],
  "ice_skate": [
    2,
    24
  ],
  "person_with_ball": [
    2,
    25
  ],
  "tent": [
    2,
    31
  ],
  "fuelpump": [
    2,
    32
  ],
  "scissors": [
    2,
    33
  ],
  "white_check_mark": [
    2,
    34
  ],
  "airplane": [
    2,
    35
  ],
  "email": [
    2,
    36
  ],
  "fist": [
    2,
    37
  ],
  "hand": [
    2,
    43
  ],
  "v": [
    3,
    0
  ],
  "writing_hand": [
    3,
    6
  ],
  "pencil2": [
    3,
    12
  ],
  "black_nib": [
    3,
    13
  ],
  "heavy_check_mark": [
    3,
    14
  ],
  "heavy_multiplication_x": [
    3,
    15
  ],
  "latin_cross": [
    3,
    16
  ],
  "star_of_david": [
    3,
    17
  ],
  "sparkles": [
    3,
    18
  ],
  "eight_spoked_asterisk": [
    3,
    19
  ],
  "eight_pointed_black_star": [
    3,
    20
  ],
  "snowflake": [
    3,
    21
  ],
  "sparkle": [
    3,
    22
  ],
  "x": [
    3,
    23
  ],
  "negative_squared_cross_mark": [
    3,
    24
  ],
  "question": [
    3,
    25
  ],
  "grey_question": [
    3,
    26
  ],
  "grey_exclamation": [
    3,
    27
  ],
  "exclamation": [
    3,
    28
  ],
  "heavy_heart_exclamation_mark_ornament": [
    3,
    29
  ],
  "heart": [
    3,
    30
  ],
  "heavy_plus_sign": [
    3,
    31
  ],
  "heavy_minus_sign": [
    3,
    32
  ],
  "heavy_division_sign": [
    3,
    33
  ],
  "arrow_right": [
    3,
    34
  ],
  "curly_loop": [
    3,
    35
  ],
  "loop": [
    3,
    36
  ],
  "arrow_heading_up": [
    3,
    37
  ],
  "arrow_heading_down": [
    3,
    38
  ],
  "arrow_left": [
    3,
    39
  ],
  "arrow_up": [
    3,
    40
  ],
  "arrow_down": [
    3,
    41
  ],
  "black_large_square": [
    3,
    42
  ],
  "white_large_square": [
    3,
    43
  ],
  "star": [
    3,
    44
  ],
  "o": [
    3,
    45
  ],
  "wavy_dash": [
    3,
    46
  ],
  "part_alternation_mark": [
    3,
    47
  ],
  "congratulations": [
    3,
    48
  ],
  "secret": [
    4,
    0
  ],
  "mahjong": [
    4,
    1
  ],
  "black_joker": [
    4,
    2
  ],
  "a": [
    4,
    3
  ],
  "b": [
    4,
    4
  ],
  "o2": [
    4,
    5
  ],
  "parking": [
    4,
    6
  ],
  "ab": [
    4,
    7
  ],
  "cl": [
    4,
    8
  ],
  "cool": [
    4,
    9
  ],
  "free": [
    4,
    10
  ],
  "id": [
    4,
    11
  ],
  "new": [
    4,
    12
  ],
  "ng": [
    4,
    13
  ],
  "ok": [
    4,
    14
  ],
  "sos": [
    4,
    15
  ],
  "up": [
    4,
    16
  ],
  "vs": [
    4,
    17
  ],
  "koko": [
    4,
    18
  ],
  "sa": [
    4,
    19
  ],
  "u7121": [
    4,
    20
  ],
  "u6307": [
    4,
    21
  ],
  "u7981": [
    4,
    22
  ],
  "u7a7a": [
    4,
    23
  ],
  "u5408": [
    4,
    24
  ],
  "u6e80": [
    4,
    25
  ],
  "u6709": [
    4,
    26
  ],
  "u6708": [
    4,
    27
  ],
  "u7533": [
    4,
    28
  ],
  "u5272": [
    4,
    29
  ],
  "u55b6": [
    4,
    30
  ],
  "ideograph_advantage": [
    4,
    31
  ],
  "accept": [
    4,
    32
  ],
  "cyclone": [
    4,
    33
  ],
  "foggy": [
    4,
    34
  ],
  "closed_umbrella": [
    4,
    35
  ],
  "night_with_stars": [
    4,
    36
  ],
  "sunrise_over_mountains": [
    4,
    37
  ],
  "sunrise": [
    4,
    38
  ],
  "city_sunset": [
    4,
    39
  ],
  "city_sunrise": [
    4,
    40
  ],
  "rainbow": [
    4,
    41
  ],
  "bridge_at_night": [
    4,
    42
  ],
  "ocean": [
    4,
    43
  ],
  "volcano": [
    4,
    44
  ],
  "milky_way": [
    4,
    45
  ],
  "earth_africa": [
    4,
    46
  ],
  "earth_americas": [
    4,
    47
  ],
  "earth_asia": [
    4,
    48
  ],
  "globe_with_meridians": [
    5,
    0
  ],
  "new_moon": [
    5,
    1
  ],
  "waxing_crescent_moon": [
    5,
    2
  ],
  "first_quarter_moon": [
    5,
    3
  ],
  "moon": [
    5,
    4
  ],
  "full_moon": [
    5,
    5
  ],
  "waning_gibbous_moon": [
    5,
    6
  ],
  "last_quarter_moon": [
    5,
    7
  ],
  "waning_crescent_moon": [
    5,
    8
  ],
  "crescent_moon": [
    5,
    9
  ],
  "new_moon_with_face": [
    5,
    10
  ],
  "first_quarter_moon_with_face": [
    5,
    11
  ],
  "last_quarter_moon_with_face": [
    5,
    12
  ],
  "full_moon_with_face": [
    5,
    13
  ],
  "sun_with_face": [
    5,
    14
  ],
  "star2": [
    5,
    15
  ],
  "stars": [
    5,
    16
  ],
  "thermometer": [
    5,
    17
  ],
  "mostly_sunny": [
    5,
    18
  ],
  "barely_sunny": [
    5,
    19
  ],
  "partly_sunny_rain": [
    5,
    20
  ],
  "rain_cloud": [
    5,
    21
  ],
  "snow_cloud": [
    5,
    22
  ],
  "lightning": [
    5,
    23
  ],
  "tornado": [
    5,
    24
  ],
  "fog": [
    5,
    25
  ],
  "wind_blowing_face": [
    5,
    26
  ],
  "hotdog": [
    5,
    27
  ],
  "taco": [
    5,
    28
  ],
  "burrito": [
    5,
    29
  ],
  "chestnut": [
    5,
    30
  ],
  "seedling": [
    5,
    31
  ],
  "evergreen_tree": [
    5,
    32
  ],
  "deciduous_tree": [
    5,
    33
  ],
  "palm_tree": [
    5,
    34
  ],
  "cactus": [
    5,
    35
  ],
  "hot_pepper": [
    5,
    36
  ],
  "tulip": [
    5,
    37
  ],
  "cherry_blossom": [
    5,
    38
  ],
  "rose": [
    5,
    39
  ],
  "hibiscus": [
    5,
    40
  ],
  "sunflower": [
    5,
    41
  ],
  "blossom": [
    5,
    42
  ],
  "corn": [
    5,
    43
  ],
  "ear_of_rice": [
    5,
    44
  ],
  "herb": [
    5,
    45
  ],
  "four_leaf_clover": [
    5,
    46
  ],
  "maple_leaf": [
    5,
    47
  ],
  "fallen_leaf": [
    5,
    48
  ],
  "leaves": [
    6,
    0
  ],
  "mushroom": [
    6,
    1
  ],
  "tomato": [
    6,
    2
  ],
  "eggplant": [
    6,
    3
  ],
  "grapes": [
    6,
    4
  ],
  "melon": [
    6,
    5
  ],
  "watermelon": [
    6,
    6
  ],
  "tangerine": [
    6,
    7
  ],
  "lemon": [
    6,
    8
  ],
  "banana": [
    6,
    9
  ],
  "pineapple": [
    6,
    10
  ],
  "apple": [
    6,
    11
  ],
  "green_apple": [
    6,
    12
  ],
  "pear": [
    6,
    13
  ],
  "peach": [
    6,
    14
  ],
  "cherries": [
    6,
    15
  ],
  "strawberry": [
    6,
    16
  ],
  "hamburger": [
    6,
    17
  ],
  "pizza": [
    6,
    18
  ],
  "meat_on_bone": [
    6,
    19
  ],
  "poultry_leg": [
    6,
    20
  ],
  "rice_cracker": [
    6,
    21
  ],
  "rice_ball": [
    6,
    22
  ],
  "rice": [
    6,
    23
  ],
  "curry": [
    6,
    24
  ],
  "ramen": [
    6,
    25
  ],
  "spaghetti": [
    6,
    26
  ],
  "bread": [
    6,
    27
  ],
  "fries": [
    6,
    28
  ],
  "sweet_potato": [
    6,
    29
  ],
  "dango": [
    6,
    30
  ],
  "oden": [
    6,
    31
  ],
  "sushi": [
    6,
    32
  ],
  "fried_shrimp": [
    6,
    33
  ],
  "fish_cake": [
    6,
    34
  ],
  "icecream": [
    6,
    35
  ],
  "shaved_ice": [
    6,
    36
  ],
  "ice_cream": [
    6,
    37
  ],
  "doughnut": [
    6,
    38
  ],
  "cookie": [
    6,
    39
  ],
  "chocolate_bar": [
    6,
    40
  ],
  "candy": [
    6,
    41
  ],
  "lollipop": [
    6,
    42
  ],
  "custard": [
    6,
    43
  ],
  "honey_pot": [
    6,
    44
  ],
  "cake": [
    6,
    45
  ],
  "bento": [
    6,
    46
  ],
  "stew": [
    6,
    47
  ],
  "fried_egg": [
    6,
    48
  ],
  "fork_and_knife": [
    7,
    0
  ],
  "tea": [
    7,
    1
  ],
  "sake": [
    7,
    2
  ],
  "wine_glass": [
    7,
    3
  ],
  "cocktail": [
    7,
    4
  ],
  "tropical_drink": [
    7,
    5
  ],
  "beer": [
    7,
    6
  ],
  "beers": [
    7,
    7
  ],
  "baby_bottle": [
    7,
    8
  ],
  "knife_fork_plate": [
    7,
    9
  ],
  "champagne": [
    7,
    10
  ],
  "popcorn": [
    7,
    11
  ],
  "ribbon": [
    7,
    12
  ],
  "gift": [
    7,
    13
  ],
  "birthday": [
    7,
    14
  ],
  "jack_o_lantern": [
    7,
    15
  ],
  "christmas_tree": [
    7,
    16
  ],
  "santa": [
    7,
    17
  ],
  "fireworks": [
    7,
    23
  ],
  "sparkler": [
    7,
    24
  ],
  "balloon": [
    7,
    25
  ],
  "tada": [
    7,
    26
  ],
  "confetti_ball": [
    7,
    27
  ],
  "tanabata_tree": [
    7,
    28
  ],
  "crossed_flags": [
    7,
    29
  ],
  "bamboo": [
    7,
    30
  ],
  "dolls": [
    7,
    31
  ],
  "flags": [
    7,
    32
  ],
  "wind_chime": [
    7,
    33
  ],
  "rice_scene": [
    7,
    34
  ],
  "school_satchel": [
    7,
    35
  ],
  "mortar_board": [
    7,
    36
  ],
  "medal": [
    7,
    37
  ],
  "reminder_ribbon": [
    7,
    38
  ],
  "studio_microphone": [
    7,
    39
  ],
  "level_slider": [
    7,
    40
  ],
  "control_knobs": [
    7,
    41
  ],
  "film_frames": [
    7,
    42
  ],
  "admission_tickets": [
    7,
    43
  ],
  "carousel_horse": [
    7,
    44
  ],
  "ferris_wheel": [
    7,
    45
  ],
  "roller_coaster": [
    7,
    46
  ],
  "fishing_pole_and_fish": [
    7,
    47
  ],
  "microphone": [
    7,
    48
  ],
  "movie_camera": [
    8,
    0
  ],
  "cinema": [
    8,
    1
  ],
  "headphones": [
    8,
    2
  ],
  "art": [
    8,
    3
  ],
  "tophat": [
    8,
    4
  ],
  "circus_tent": [
    8,
    5
  ],
  "ticket": [
    8,
    6
  ],
  "clapper": [
    8,
    7
  ],
  "performing_arts": [
    8,
    8
  ],
  "video_game": [
    8,
    9
  ],
  "dart": [
    8,
    10
  ],
  "slot_machine": [
    8,
    11
  ],
  "8ball": [
    8,
    12
  ],
  "game_die": [
    8,
    13
  ],
  "bowling": [
    8,
    14
  ],
  "flower_playing_cards": [
    8,
    15
  ],
  "musical_note": [
    8,
    16
  ],
  "notes": [
    8,
    17
  ],
  "saxophone": [
    8,
    18
  ],
  "guitar": [
    8,
    19
  ],
  "musical_keyboard": [
    8,
    20
  ],
  "trumpet": [
    8,
    21
  ],
  "violin": [
    8,
    22
  ],
  "musical_score": [
    8,
    23
  ],
  "running_shirt_with_sash": [
    8,
    24
  ],
  "tennis": [
    8,
    25
  ],
  "ski": [
    8,
    26
  ],
  "basketball": [
    8,
    27
  ],
  "checkered_flag": [
    8,
    28
  ],
  "snowboarder": [
    8,
    29
  ],
  "runner": [
    8,
    35
  ],
  "surfer": [
    8,
    41
  ],
  "sports_medal": [
    8,
    47
  ],
  "trophy": [
    8,
    48
  ],
  "horse_racing": [
    9,
    0
  ],
  "football": [
    9,
    6
  ],
  "rugby_football": [
    9,
    7
  ],
  "swimmer": [
    9,
    8
  ],
  "weight_lifter": [
    9,
    14
  ],
  "golfer": [
    9,
    20
  ],
  "racing_motorcycle": [
    9,
    26
  ],
  "racing_car": [
    9,
    27
  ],
  "cricket_bat_and_ball": [
    9,
    28
  ],
  "volleyball": [
    9,
    29
  ],
  "field_hockey_stick_and_ball": [
    9,
    30
  ],
  "ice_hockey_stick_and_puck": [
    9,
    31
  ],
  "table_tennis_paddle_and_ball": [
    9,
    32
  ],
  "snow_capped_mountain": [
    9,
    33
  ],
  "camping": [
    9,
    34
  ],
  "beach_with_umbrella": [
    9,
    35
  ],
  "building_construction": [
    9,
    36
  ],
  "house_buildings": [
    9,
    37
  ],
  "cityscape": [
    9,
    38
  ],
  "derelict_house_building": [
    9,
    39
  ],
  "classical_building": [
    9,
    40
  ],
  "desert": [
    9,
    41
  ],
  "desert_island": [
    9,
    42
  ],
  "national_park": [
    9,
    43
  ],
  "stadium": [
    9,
    44
  ],
  "house": [
    9,
    45
  ],
  "house_with_garden": [
    9,
    46
  ],
  "office": [
    9,
    47
  ],
  "post_office": [
    9,
    48
  ],
  "european_post_office": [
    10,
    0
  ],
  "hospital": [
    10,
    1
  ],
  "bank": [
    10,
    2
  ],
  "atm": [
    10,
    3
  ],
  "hotel": [
    10,
    4
  ],
  "love_hotel": [
    10,
    5
  ],
  "convenience_store": [
    10,
    6
  ],
  "school": [
    10,
    7
  ],
  "department_store": [
    10,
    8
  ],
  "factory": [
    10,
    9
  ],
  "izakaya_lantern": [
    10,
    10
  ],
  "japanese_castle": [
    10,
    11
  ],
  "european_castle": [
    10,
    12
  ],
  "waving_white_flag": [
    10,
    13
  ],
  "waving_black_flag": [
    10,
    14
  ],
  "rosette": [
    10,
    15
  ],
  "label": [
    10,
    16
  ],
  "badminton_racquet_and_shuttlecock": [
    10,
    17
  ],
  "bow_and_arrow": [
    10,
    18
  ],
  "amphora": [
    10,
    19
  ],
  "skin-tone-2": [
    10,
    20
  ],
  "skin-tone-3": [
    10,
    21
  ],
  "skin-tone-4": [
    10,
    22
  ],
  "skin-tone-5": [
    10,
    23
  ],
  "skin-tone-6": [
    10,
    24
  ],
  "rat": [
    10,
    25
  ],
  "mouse2": [
    10,
    26
  ],
  "ox": [
    10,
    27
  ],
  "water_buffalo": [
    10,
    28
  ],
  "cow2": [
    10,
    29
  ],
  "tiger2": [
    10,
    30
  ],
  "leopard": [
    10,
    31
  ],
  "rabbit2": [
    10,
    32
  ],
  "cat2": [
    10,
    33
  ],
  "dragon": [
    10,
    34
  ],
  "crocodile": [
    10,
    35
  ],
  "whale2": [
    10,
    36
  ],
  "snail": [
    10,
    37
  ],
  "snake": [
    10,
    38
  ],
  "racehorse": [
    10,
    39
  ],
  "ram": [
    10,
    40
  ],
  "goat": [
    10,
    41
  ],
  "sheep": [
    10,
    42
  ],
  "monkey": [
    10,
    43
  ],
  "rooster": [
    10,
    44
  ],
  "chicken": [
    10,
    45
  ],
  "dog2": [
    10,
    46
  ],
  "pig2": [
    10,
    47
  ],
  "boar": [
    10,
    48
  ],
  "elephant": [
    11,
    0
  ],
  "octopus": [
    11,
    1
  ],
  "shell": [
    11,
    2
  ],
  "bug": [
    11,
    3
  ],
  "ant": [
    11,
    4
  ],
  "bee": [
    11,
    5
  ],
  "beetle": [
    11,
    6
  ],
  "fish": [
    11,
    7
  ],
  "tropical_fish": [
    11,
    8
  ],
  "blowfish": [
    11,
    9
  ],
  "turtle": [
    11,
    10
  ],
  "hatching_chick": [
    11,
    11
  ],
  "baby_chick": [
    11,
    12
  ],
  "hatched_chick": [
    11,
    13
  ],
  "bird": [
    11,
    14
  ],
  "penguin": [
    11,
    15
  ],
  "koala": [
    11,
    16
  ],
  "poodle": [
    11,
    17
  ],
  "dromedary_camel": [
    11,
    18
  ],
  "camel": [
    11,
    19
  ],
  "dolphin": [
    11,
    20
  ],
  "mouse": [
    11,
    21
  ],
  "cow": [
    11,
    22
  ],
  "tiger": [
    11,
    23
  ],
  "rabbit": [
    11,
    24
  ],
  "cat": [
    11,
    25
  ],
  "dragon_face": [
    11,
    26
  ],
  "whale": [
    11,
    27
  ],
  "horse": [
    11,
    28
  ],
  "monkey_face": [
    11,
    29
  ],
  "dog": [
    11,
    30
  ],
  "pig": [
    11,
    31
  ],
  "frog": [
    11,
    32
  ],
  "hamster": [
    11,
    33
  ],
  "wolf": [
    11,
    34
  ],
  "bear": [
    11,
    35
  ],
  "panda_face": [
    11,
    36
  ],
  "pig_nose": [
    11,
    37
  ],
  "feet": [
    11,
    38
  ],
  "chipmunk": [
    11,
    39
  ],
  "eyes": [
    11,
    40
  ],
  "eye": [
    11,
    41
  ],
  "ear": [
    11,
    42
  ],
  "nose": [
    11,
    48
  ],
  "lips": [
    12,
    5
  ],
  "tongue": [
    12,
    6
  ],
  "point_up_2": [
    12,
    7
  ],
  "point_down": [
    12,
    13
  ],
  "point_left": [
    12,
    19
  ],
  "point_right": [
    12,
    25
  ],
  "facepunch": [
    12,
    31
  ],
  "wave": [
    12,
    37
  ],
  "ok_hand": [
    12,
    43
  ],
  "+1": [
    13,
    0
  ],
  "-1": [
    13,
    6
  ],
  "clap": [
    13,
    12
  ],
  "open_hands": [
    13,
    18
  ],
  "crown": [
    13,
    24
  ],
  "womans_hat": [
    13,
    25
  ],
  "eyeglasses": [
    13,
    26
  ],
  "necktie": [
    13,
    27
  ],
  "shirt": [
    13,
    28
  ],
  "jeans": [
    13,
    29
  ],
  "dress": [
    13,
    30
  ],
  "kimono": [
    13,
    31
  ],
  "bikini": [
    13,
    32
  ],
  "womans_clothes": [
    13,
    33
  ],
  "purse": [
    13,
    34
  ],
  "handbag": [
    13,
    35
  ],
  "pouch": [
    13,
    36
  ],
  "mans_shoe": [
    13,
    37
  ],
  "athletic_shoe": [
    13,
    38
  ],
  "high_heel": [
    13,
    39
  ],
  "sandal": [
    13,
    40
  ],
  "boot": [
    13,
    41
  ],
  "footprints": [
    13,
    42
  ],
  "bust_in_silhouette": [
    13,
    43
  ],
  "busts_in_silhouette": [
    13,
    44
  ],
  "boy": [
    13,
    45
  ],
  "girl": [
    14,
    2
  ],
  "man": [
    14,
    8
  ],
  "woman": [
    14,
    14
  ],
  "family": [
    14,
    20
  ],
  "couple": [
    14,
    21
  ],
  "two_men_holding_hands": [
    14,
    22
  ],
  "two_women_holding_hands": [
    14,
    23
  ],
  "cop": [
    14,
    24
  ],
  "dancers": [
    14,
    30
  ],
  "bride_with_veil": [
    14,
    31
  ],
  "person_with_blond_hair": [
    14,
    37
  ],
  "man_with_gua_pi_mao": [
    14,
    43
  ],
  "man_with_turban": [
    15,
    0
  ],
  "older_man": [
    15,
    6
  ],
  "older_woman": [
    15,
    12
  ],
  "baby": [
    15,
    18
  ],
  "construction_worker": [
    15,
    24
  ],
  "princess": [
    15,
    30
  ],
  "japanese_ogre": [
    15,
    36
  ],
  "japanese_goblin": [
    15,
    37
  ],
  "ghost": [
    15,
    38
  ],
  "angel": [
    15,
    39
  ],
  "alien": [
    15,
    45
  ],
  "space_invader": [
    15,
    46
  ],
  "imp": [
    15,
    47
  ],
  "skull": [
    15,
    48
  ],
  "information_desk_person": [
    16,
    0
  ],
  "guardsman": [
    16,
    6
  ],
  "dancer": [
    16,
    12
  ],
  "lipstick": [
    16,
    18
  ],
  "nail_care": [
    16,
    19
  ],
  "massage": [
    16,
    25
  ],
  "haircut": [
    16,
    31
  ],
  "barber": [
    16,
    37
  ],
  "syringe": [
    16,
    38
  ],
  "pill": [
    16,
    39
  ],
  "kiss": [
    16,
    40
  ],
  "love_letter": [
    16,
    41
  ],
  "ring": [
    16,
    42
  ],
  "gem": [
    16,
    43
  ],
  "couplekiss": [
    16,
    44
  ],
  "bouquet": [
    16,
    45
  ],
  "couple_with_heart": [
    16,
    46
  ],
  "wedding": [
    16,
    47
  ],
  "heartbeat": [
    16,
    48
  ],
  "broken_heart": [
    17,
    0
  ],
  "two_hearts": [
    17,
    1
  ],
  "sparkling_heart": [
    17,
    2
  ],
  "heartpulse": [
    17,
    3
  ],
  "cupid": [
    17,
    4
  ],
  "blue_heart": [
    17,
    5
  ],
  "green_heart": [
    17,
    6
  ],
  "yellow_heart": [
    17,
    7
  ],
  "purple_heart": [
    17,
    8
  ],
  "gift_heart": [
    17,
    9
  ],
  "revolving_hearts": [
    17,
    10
  ],
  "heart_decoration": [
    17,
    11
  ],
  "diamond_shape_with_a_dot_inside": [
    17,
    12
  ],
  "bulb": [
    17,
    13
  ],
  "anger": [
    17,
    14
  ],
  "bomb": [
    17,
    15
  ],
  "zzz": [
    17,
    16
  ],
  "boom": [
    17,
    17
  ],
  "sweat_drops": [
    17,
    18
  ],
  "droplet": [
    17,
    19
  ],
  "dash": [
    17,
    20
  ],
  "hankey": [
    17,
    21
  ],
  "muscle": [
    17,
    22
  ],
  "dizzy": [
    17,
    28
  ],
  "speech_balloon": [
    17,
    29
  ],
  "thought_balloon": [
    17,
    30
  ],
  "white_flower": [
    17,
    31
  ],
  "moneybag": [
    17,
    33
  ],
  "currency_exchange": [
    17,
    34
  ],
  "heavy_dollar_sign": [
    17,
    35
  ],
  "credit_card": [
    17,
    36
  ],
  "yen": [
    17,
    37
  ],
  "dollar": [
    17,
    38
  ],
  "euro": [
    17,
    39
  ],
  "pound": [
    17,
    40
  ],
  "money_with_wings": [
    17,
    41
  ],
  "chart": [
    17,
    42
  ],
  "seat": [
    17,
    43
  ],
  "computer": [
    17,
    44
  ],
  "briefcase": [
    17,
    45
  ],
  "minidisc": [
    17,
    46
  ],
  "floppy_disk": [
    17,
    47
  ],
  "cd": [
    17,
    48
  ],
  "dvd": [
    18,
    0
  ],
  "file_folder": [
    18,
    1
  ],
  "open_file_folder": [
    18,
    2
  ],
  "page_with_curl": [
    18,
    3
  ],
  "page_facing_up": [
    18,
    4
  ],
  "date": [
    18,
    5
  ],
  "calendar": [
    18,
    6
  ],
  "card_index": [
    18,
    7
  ],
  "chart_with_upwards_trend": [
    18,
    8
  ],
  "chart_with_downwards_trend": [
    18,
    9
  ],
  "bar_chart": [
    18,
    10
  ],
  "clipboard": [
    18,
    11
  ],
  "pushpin": [
    18,
    12
  ],
  "round_pushpin": [
    18,
    13
  ],
  "paperclip": [
    18,
    14
  ],
  "straight_ruler": [
    18,
    15
  ],
  "triangular_ruler": [
    18,
    16
  ],
  "bookmark_tabs": [
    18,
    17
  ],
  "ledger": [
    18,
    18
  ],
  "notebook": [
    18,
    19
  ],
  "notebook_with_decorative_cover": [
    18,
    20
  ],
  "closed_book": [
    18,
    21
  ],
  "book": [
    18,
    22
  ],
  "green_book": [
    18,
    23
  ],
  "blue_book": [
    18,
    24
  ],
  "orange_book": [
    18,
    25
  ],
  "books": [
    18,
    26
  ],
  "name_badge": [
    18,
    27
  ],
  "scroll": [
    18,
    28
  ],
  "memo": [
    18,
    29
  ],
  "telephone_receiver": [
    18,
    30
  ],
  "pager": [
    18,
    31
  ],
  "fax": [
    18,
    32
  ],
  "satellite_antenna": [
    18,
    33
  ],
  "loudspeaker": [
    18,
    34
  ],
  "mega": [
    18,
    35
  ],
  "outbox_tray": [
    18,
    36
  ],
  "inbox_tray": [
    18,
    37
  ],
  "package": [
    18,
    38
  ],
  "e-mail": [
    18,
    39
  ],
  "incoming_envelope": [
    18,
    40
  ],
  "envelope_with_arrow": [
    18,
    41
  ],
  "mailbox_closed": [
    18,
    42
  ],
  "mailbox": [
    18,
    43
  ],
  "mailbox_with_mail": [
    18,
    44
  ],
  "mailbox_with_no_mail": [
    18,
    45
  ],
  "postbox": [
    18,
    46
  ],
  "postal_horn": [
    18,
    47
  ],
  "newspaper": [
    18,
    48
  ],
  "iphone": [
    19,
    0
  ],
  "calling": [
    19,
    1
  ],
  "vibration_mode": [
    19,
    2
  ],
  "mobile_phone_off": [
    19,
    3
  ],
  "no_mobile_phones": [
    19,
    4
  ],
  "signal_strength": [
    19,
    5
  ],
  "camera": [
    19,
    6
  ],
  "camera_with_flash": [
    19,
    7
  ],
  "video_camera": [
    19,
    8
  ],
  "tv": [
    19,
    9
  ],
  "radio": [
    19,
    10
  ],
  "vhs": [
    19,
    11
  ],
  "film_projector": [
    19,
    12
  ],
  "prayer_beads": [
    19,
    13
  ],
  "twisted_rightwards_arrows": [
    19,
    14
  ],
  "repeat": [
    19,
    15
  ],
  "repeat_one": [
    19,
    16
  ],
  "arrows_clockwise": [
    19,
    17
  ],
  "arrows_counterclockwise": [
    19,
    18
  ],
  "low_brightness": [
    19,
    19
  ],
  "high_brightness": [
    19,
    20
  ],
  "mute": [
    19,
    21
  ],
  "speaker": [
    19,
    22
  ],
  "sound": [
    19,
    23
  ],
  "loud_sound": [
    19,
    24
  ],
  "battery": [
    19,
    25
  ],
  "electric_plug": [
    19,
    26
  ],
  "mag": [
    19,
    27
  ],
  "mag_right": [
    19,
    28
  ],
  "lock_with_ink_pen": [
    19,
    29
  ],
  "closed_lock_with_key": [
    19,
    30
  ],
  "key": [
    19,
    31
  ],
  "lock": [
    19,
    32
  ],
  "unlock": [
    19,
    33
  ],
  "bell": [
    19,
    34
  ],
  "no_bell": [
    19,
    35
  ],
  "bookmark": [
    19,
    36
  ],
  "link": [
    19,
    37
  ],
  "radio_button": [
    19,
    38
  ],
  "back": [
    19,
    39
  ],
  "end": [
    19,
    40
  ],
  "on": [
    19,
    41
  ],
  "soon": [
    19,
    42
  ],
  "top": [
    19,
    43
  ],
  "underage": [
    19,
    44
  ],
  "keycap_ten": [
    19,
    45
  ],
  "capital_abcd": [
    19,
    46
  ],
  "abcd": [
    19,
    47
  ],
  "symbols": [
    20,
    0
  ],
  "abc": [
    20,
    1
  ],
  "fire": [
    20,
    2
  ],
  "flashlight": [
    20,
    3
  ],
  "wrench": [
    20,
    4
  ],
  "hammer": [
    20,
    5
  ],
  "nut_and_bolt": [
    20,
    6
  ],
  "hocho": [
    20,
    7
  ],
  "gun": [
    20,
    8
  ],
  "microscope": [
    20,
    9
  ],
  "telescope": [
    20,
    10
  ],
  "crystal_ball": [
    20,
    11
  ],
  "six_pointed_star": [
    20,
    12
  ],
  "beginner": [
    20,
    13
  ],
  "trident": [
    20,
    14
  ],
  "black_square_button": [
    20,
    15
  ],
  "white_square_button": [
    20,
    16
  ],
  "red_circle": [
    20,
    17
  ],
  "large_blue_circle": [
    20,
    18
  ],
  "large_orange_diamond": [
    20,
    19
  ],
  "large_blue_diamond": [
    20,
    20
  ],
  "small_orange_diamond": [
    20,
    21
  ],
  "small_blue_diamond": [
    20,
    22
  ],
  "small_red_triangle": [
    20,
    23
  ],
  "small_red_triangle_down": [
    20,
    24
  ],
  "arrow_up_small": [
    20,
    25
  ],
  "arrow_down_small": [
    20,
    26
  ],
  "om_symbol": [
    20,
    27
  ],
  "dove_of_peace": [
    20,
    28
  ],
  "kaaba": [
    20,
    29
  ],
  "mosque": [
    20,
    30
  ],
  "synagogue": [
    20,
    31
  ],
  "menorah_with_nine_branches": [
    20,
    32
  ],
  "clock1": [
    20,
    33
  ],
  "clock2": [
    20,
    34
  ],
  "clock3": [
    20,
    35
  ],
  "clock4": [
    20,
    36
  ],
  "clock5": [
    20,
    37
  ],
  "clock6": [
    20,
    38
  ],
  "clock7": [
    20,
    39
  ],
  "clock8": [
    20,
    40
  ],
  "clock9": [
    20,
    41
  ],
  "clock10": [
    20,
    42
  ],
  "clock11": [
    20,
    43
  ],
  "clock12": [
    20,
    44
  ],
  "clock130": [
    20,
    45
  ],
  "clock230": [
    20,
    46
  ],
  "clock330": [
    20,
    47
  ],
  "clock430": [
    20,
    48
  ],
  "clock530": [
    21,
    0
  ],
  "clock630": [
    21,
    1
  ],
  "clock730": [
    21,
    2
  ],
  "clock830": [
    21,
    3
  ],
  "clock930": [
    21,
    4
  ],
  "clock1030": [
    21,
    5
  ],
  "clock1130": [
    21,
    6
  ],
  "clock1230": [
    21,
    7
  ],
  "candle": [
    21,
    8
  ],
  "mantelpiece_clock": [
    21,
    9
  ],
  "hole": [
    21,
    10
  ],
  "man_in_business_suit_levitating": [
    21,
    11
  ],
  "sleuth_or_spy": [
    21,
    17
  ],
  "dark_sunglasses": [
    21,
    23
  ],
  "spider": [
    21,
    24
  ],
  "spider_web": [
    21,
    25
  ],
  "joystick": [
    21,
    26
  ],
  "man_dancing": [
    21,
    27
  ],
  "linked_paperclips": [
    21,
    33
  ],
  "lower_left_ballpoint_pen": [
    21,
    34
  ],
  "lower_left_fountain_pen": [
    21,
    35
  ],
  "lower_left_paintbrush": [
    21,
    36
  ],
  "lower_left_crayon": [
    21,
    37
  ],
  "raised_hand_with_fingers_splayed": [
    21,
    38
  ],
  "middle_finger": [
    21,
    44
  ],
  "spock-hand": [
    22,
    1
  ],
  "black_heart": [
    22,
    7
  ],
  "desktop_computer": [
    22,
    8
  ],
  "printer": [
    22,
    9
  ],
  "three_button_mouse": [
    22,
    10
  ],
  "trackball": [
    22,
    11
  ],
  "frame_with_picture": [
    22,
    12
  ],
  "card_index_dividers": [
    22,
    13
  ],
  "card_file_box": [
    22,
    14
  ],
  "file_cabinet": [
    22,
    15
  ],
  "wastebasket": [
    22,
    16
  ],
  "spiral_note_pad": [
    22,
    17
  ],
  "spiral_calendar_pad": [
    22,
    18
  ],
  "compression": [
    22,
    19
  ],
  "old_key": [
    22,
    20
  ],
  "rolled_up_newspaper": [
    22,
    21
  ],
  "dagger_knife": [
    22,
    22
  ],
  "speaking_head_in_silhouette": [
    22,
    23
  ],
  "left_speech_bubble": [
    22,
    24
  ],
  "right_anger_bubble": [
    22,
    25
  ],
  "ballot_box_with_ballot": [
    22,
    26
  ],
  "world_map": [
    22,
    27
  ],
  "mount_fuji": [
    22,
    28
  ],
  "tokyo_tower": [
    22,
    29
  ],
  "statue_of_liberty": [
    22,
    30
  ],
  "japan": [
    22,
    31
  ],
  "moyai": [
    22,
    32
  ],
  "grinning": [
    22,
    33
  ],
  "grin": [
    22,
    34
  ],
  "joy": [
    22,
    35
  ],
  "smiley": [
    22,
    36
  ],
  "smile": [
    22,
    37
  ],
  "sweat_smile": [
    22,
    38
  ],
  "laughing": [
    22,
    39
  ],
  "innocent": [
    22,
    40
  ],
  "smiling_imp": [
    22,
    41
  ],
  "wink": [
    22,
    42
  ],
  "blush": [
    22,
    43
  ],
  "yum": [
    22,
    44
  ],
  "relieved": [
    22,
    45
  ],
  "heart_eyes": [
    22,
    46
  ],
  "sunglasses": [
    22,
    47
  ],
  "smirk": [
    22,
    48
  ],
  "neutral_face": [
    23,
    0
  ],
  "expressionless": [
    23,
    1
  ],
  "unamused": [
    23,
    2
  ],
  "sweat": [
    23,
    3
  ],
  "pensive": [
    23,
    4
  ],
  "confused": [
    23,
    5
  ],
  "confounded": [
    23,
    6
  ],
  "kissing": [
    23,
    7
  ],
  "kissing_heart": [
    23,
    8
  ],
  "kissing_smiling_eyes": [
    23,
    9
  ],
  "kissing_closed_eyes": [
    23,
    10
  ],
  "stuck_out_tongue": [
    23,
    11
  ],
  "stuck_out_tongue_winking_eye": [
    23,
    12
  ],
  "stuck_out_tongue_closed_eyes": [
    23,
    13
  ],
  "disappointed": [
    23,
    14
  ],
  "worried": [
    23,
    15
  ],
  "angry": [
    23,
    16
  ],
  "rage": [
    23,
    17
  ],
  "cry": [
    23,
    18
  ],
  "persevere": [
    23,
    19
  ],
  "triumph": [
    23,
    20
  ],
  "disappointed_relieved": [
    23,
    21
  ],
  "frowning": [
    23,
    22
  ],
  "anguished": [
    23,
    23
  ],
  "fearful": [
    23,
    24
  ],
  "weary": [
    23,
    25
  ],
  "sleepy": [
    23,
    26
  ],
  "tired_face": [
    23,
    27
  ],
  "grimacing": [
    23,
    28
  ],
  "sob": [
    23,
    29
  ],
  "open_mouth": [
    23,
    30
  ],
  "hushed": [
    23,
    31
  ],
  "cold_sweat": [
    23,
    32
  ],
  "scream": [
    23,
    33
  ],
  "astonished": [
    23,
    34
  ],
  "flushed": [
    23,
    35
  ],
  "sleeping": [
    23,
    36
  ],
  "dizzy_face": [
    23,
    37
  ],
  "no_mouth": [
    23,
    38
  ],
  "mask": [
    23,
    39
  ],
  "smile_cat": [
    23,
    40
  ],
  "joy_cat": [
    23,
    41
  ],
  "smiley_cat": [
    23,
    42
  ],
  "heart_eyes_cat": [
    23,
    43
  ],
  "smirk_cat": [
    23,
    44
  ],
  "kissing_cat": [
    23,
    45
  ],
  "pouting_cat": [
    23,
    46
  ],
  "crying_cat_face": [
    23,
    47
  ],
  "scream_cat": [
    23,
    48
  ],
  "slightly_frowning_face": [
    24,
    0
  ],
  "slightly_smiling_face": [
    24,
    1
  ],
  "upside_down_face": [
    24,
    2
  ],
  "face_with_rolling_eyes": [
    24,
    3
  ],
  "no_good": [
    24,
    4
  ],
  "ok_woman": [
    24,
    10
  ],
  "bow": [
    24,
    16
  ],
  "see_no_evil": [
    24,
    22
  ],
  "hear_no_evil": [
    24,
    23
  ],
  "speak_no_evil": [
    24,
    24
  ],
  "raising_hand": [
    24,
    25
  ],
  "raised_hands": [
    24,
    31
  ],
  "person_frowning": [
    24,
    37
  ],
  "person_with_pouting_face": [
    24,
    43
  ],
  "pray": [
    25,
    0
  ],
  "rocket": [
    25,
    6
  ],
  "helicopter": [
    25,
    7
  ],
  "steam_locomotive": [
    25,
    8
  ],
  "railway_car": [
    25,
    9
  ],
  "bullettrain_side": [
    25,
    10
  ],
  "bullettrain_front": [
    25,
    11
  ],
  "train2": [
    25,
    12
  ],
  "metro": [
    25,
    13
  ],
  "light_rail": [
    25,
    14
  ],
  "station": [
    25,
    15
  ],
  "tram": [
    25,
    16
  ],
  "train": [
    25,
    17
  ],
  "bus": [
    25,
    18
  ],
  "oncoming_bus": [
    25,
    19
  ],
  "trolleybus": [
    25,
    20
  ],
  "busstop": [
    25,
    21
  ],
  "minibus": [
    25,
    22
  ],
  "ambulance": [
    25,
    23
  ],
  "fire_engine": [
    25,
    24
  ],
  "police_car": [
    25,
    25
  ],
  "oncoming_police_car": [
    25,
    26
  ],
  "taxi": [
    25,
    27
  ],
  "oncoming_taxi": [
    25,
    28
  ],
  "car": [
    25,
    29
  ],
  "oncoming_automobile": [
    25,
    30
  ],
  "blue_car": [
    25,
    31
  ],
  "truck": [
    25,
    32
  ],
  "articulated_lorry": [
    25,
    33
  ],
  "tractor": [
    25,
    34
  ],
  "monorail": [
    25,
    35
  ],
  "mountain_railway": [
    25,
    36
  ],
  "suspension_railway": [
    25,
    37
  ],
  "mountain_cableway": [
    25,
    38
  ],
  "aerial_tramway": [
    25,
    39
  ],
  "ship": [
    25,
    40
  ],
  "rowboat": [
    25,
    41
  ],
  "speedboat": [
    25,
    47
  ],
  "traffic_light": [
    25,
    48
  ],
  "vertical_traffic_light": [
    26,
    0
  ],
  "construction": [
    26,
    1
  ],
  "rotating_light": [
    26,
    2
  ],
  "triangular_flag_on_post": [
    26,
    3
  ],
  "door": [
    26,
    4
  ],
  "no_entry_sign": [
    26,
    5
  ],
  "smoking": [
    26,
    6
  ],
  "no_smoking": [
    26,
    7
  ],
  "put_litter_in_its_place": [
    26,
    8
  ],
  "do_not_litter": [
    26,
    9
  ],
  "potable_water": [
    26,
    10
  ],
  "non-potable_water": [
    26,
    11
  ],
  "bike": [
    26,
    12
  ],
  "no_bicycles": [
    26,
    13
  ],
  "bicyclist": [
    26,
    14
  ],
  "mountain_bicyclist": [
    26,
    20
  ],
  "walking": [
    26,
    26
  ],
  "no_pedestrians": [
    26,
    32
  ],
  "children_crossing": [
    26,
    33
  ],
  "mens": [
    26,
    34
  ],
  "womens": [
    26,
    35
  ],
  "restroom": [
    26,
    36
  ],
  "baby_symbol": [
    26,
    37
  ],
  "toilet": [
    26,
    38
  ],
  "wc": [
    26,
    39
  ],
  "shower": [
    26,
    40
  ],
  "bath": [
    26,
    41
  ],
  "bathtub": [
    26,
    47
  ],
  "passport_control": [
    26,
    48
  ],
  "customs": [
    27,
    0
  ],
  "baggage_claim": [
    27,
    1
  ],
  "left_luggage": [
    27,
    2
  ],
  "couch_and_lamp": [
    27,
    3
  ],
  "sleeping_accommodation": [
    27,
    4
  ],
  "shopping_bags": [
    27,
    10
  ],
  "bellhop_bell": [
    27,
    11
  ],
  "bed": [
    27,
    12
  ],
  "place_of_worship": [
    27,
    13
  ],
  "octagonal_sign": [
    27,
    14
  ],
  "shopping_trolley": [
    27,
    15
  ],
  "hammer_and_wrench": [
    27,
    16
  ],
  "shield": [
    27,
    17
  ],
  "oil_drum": [
    27,
    18
  ],
  "motorway": [
    27,
    19
  ],
  "railway_track": [
    27,
    20
  ],
  "motor_boat": [
    27,
    21
  ],
  "small_airplane": [
    27,
    22
  ],
  "airplane_departure": [
    27,
    23
  ],
  "airplane_arriving": [
    27,
    24
  ],
  "satellite": [
    27,
    25
  ],
  "passenger_ship": [
    27,
    26
  ],
  "scooter": [
    27,
    27
  ],
  "motor_scooter": [
    27,
    28
  ],
  "canoe": [
    27,
    29
  ],
  "zipper_mouth_face": [
    27,
    30
  ],
  "money_mouth_face": [
    27,
    31
  ],
  "face_with_thermometer": [
    27,
    32
  ],
  "nerd_face": [
    27,
    33
  ],
  "thinking_face": [
    27,
    34
  ],
  "face_with_head_bandage": [
    27,
    35
  ],
  "robot_face": [
    27,
    36
  ],
  "hugging_face": [
    27,
    37
  ],
  "the_horns": [
    27,
    38
  ],
  "call_me_hand": [
    27,
    44
  ],
  "raised_back_of_hand": [
    28,
    1
  ],
  "left-facing_fist": [
    28,
    7
  ],
  "right-facing_fist": [
    28,
    13
  ],
  "handshake": [
    28,
    19
  ],
  "hand_with_index_and_middle_fingers_crossed": [
    28,
    20
  ],
  "face_with_cowboy_hat": [
    28,
    26
  ],
  "clown_face": [
    28,
    27
  ],
  "nauseated_face": [
    28,
    28
  ],
  "rolling_on_the_floor_laughing": [
    28,
    29
  ],
  "drooling_face": [
    28,
    30
  ],
  "lying_face": [
    28,
    31
  ],
  "face_palm": [
    28,
    32
  ],
  "sneezing_face": [
    28,
    38
  ],
  "pregnant_woman": [
    28,
    39
  ],
  "selfie": [
    28,
    45
  ],
  "prince": [
    29,
    2
  ],
  "man_in_tuxedo": [
    29,
    8
  ],
  "mother_christmas": [
    29,
    14
  ],
  "shrug": [
    29,
    20
  ],
  "person_doing_cartwheel": [
    29,
    26
  ],
  "juggling": [
    29,
    32
  ],
  "fencer": [
    29,
    38
  ],
  "wrestlers": [
    29,
    39
  ],
  "water_polo": [
    29,
    40
  ],
  "handball": [
    29,
    46
  ],
  "wilted_flower": [
    30,
    3
  ],
  "drum_with_drumsticks": [
    30,
    4
  ],
  "clinking_glasses": [
    30,
    5
  ],
  "tumbler_glass": [
    30,
    6
  ],
  "spoon": [
    30,
    7
  ],
  "goal_net": [
    30,
    8
  ],
  "first_place_medal": [
    30,
    9
  ],
  "second_place_medal": [
    30,
    10
  ],
  "third_place_medal": [
    30,
    11
  ],
  "boxing_glove": [
    30,
    12
  ],
  "martial_arts_uniform": [
    30,
    13
  ],
  "croissant": [
    30,
    14
  ],
  "avocado": [
    30,
    15
  ],
  "cucumber": [
    30,
    16
  ],
  "bacon": [
    30,
    17
  ],
  "potato": [
    30,
    18
  ],
  "carrot": [
    30,
    19
  ],
  "baguette_bread": [
    30,
    20
  ],
  "green_salad": [
    30,
    21
  ],
  "shallow_pan_of_food": [
    30,
    22
  ],
  "stuffed_flatbread": [
    30,
    23
  ],
  "egg": [
    30,
    24
  ],
  "glass_of_milk": [
    30,
    25
  ],
  "peanuts": [
    30,
    26
  ],
  "kiwifruit": [
    30,
    27
  ],
  "pancakes": [
    30,
    28
  ],
  "crab": [
    30,
    29
  ],
  "lion_face": [
    30,
    30
  ],
  "scorpion": [
    30,
    31
  ],
  "turkey": [
    30,
    32
  ],
  "unicorn_face": [
    30,
    33
  ],
  "eagle": [
    30,
    34
  ],
  "duck": [
    30,
    35
  ],
  "bat": [
    30,
    36
  ],
  "shark": [
    30,
    37
  ],
  "owl": [
    30,
    38
  ],
  "fox_face": [
    30,
    39
  ],
  "butterfly": [
    30,
    40
  ],
  "deer": [
    30,
    41
  ],
  "gorilla": [
    30,
    42
  ],
  "lizard": [
    30,
    43
  ],
  "rhinoceros": [
    30,
    44
  ],
  "shrimp": [
    30,
    45
  ],
  "squid": [
    30,
    46
  ],
  "cheese_wedge": [
    30,
    47
  ],
  "hash": [
    30,
    48
  ],
  "keycap_star": [
    31,
    0
  ],
  "zero": [
    31,
    1
  ],
  "one": [
    31,
    2
  ],
  "two": [
    31,
    3
  ],
  "three": [
    31,
    4
  ],
  "four": [
    31,
    5
  ],
  "five": [
    31,
    6
  ],
  "six": [
    31,
    7
  ],
  "seven": [
    31,
    8
  ],
  "eight": [
    31,
    9
  ],
  "nine": [
    31,
    10
  ],
  "flag-ac": [
    31,
    11
  ],
  "flag-ad": [
    31,
    12
  ],
  "flag-ae": [
    31,
    13
  ],
  "flag-af": [
    31,
    14
  ],
  "flag-ag": [
    31,
    15
  ],
  "flag-ai": [
    31,
    16
  ],
  "flag-al": [
    31,
    17
  ],
  "flag-am": [
    31,
    18
  ],
  "flag-ao": [
    31,
    19
  ],
  "flag-aq": [
    31,
    20
  ],
  "flag-ar": [
    31,
    21
  ],
  "flag-as": [
    31,
    22
  ],
  "flag-at": [
    31,
    23
  ],
  "flag-au": [
    31,
    24
  ],
  "flag-aw": [
    31,
    25
  ],
  "flag-ax": [
    31,
    26
  ],
  "flag-az": [
    31,
    27
  ],
  "flag-ba": [
    31,
    28
  ],
  "flag-bb": [
    31,
    29
  ],
  "flag-bd": [
    31,
    30
  ],
  "flag-be": [
    31,
    31
  ],
  "flag-bf": [
    31,
    32
  ],
  "flag-bg": [
    31,
    33
  ],
  "flag-bh": [
    31,
    34
  ],
  "flag-bi": [
    31,
    35
  ],
  "flag-bj": [
    31,
    36
  ],
  "flag-bl": [
    31,
    37
  ],
  "flag-bm": [
    31,
    38
  ],
  "flag-bn": [
    31,
    39
  ],
  "flag-bo": [
    31,
    40
  ],
  "flag-bq": [
    31,
    41
  ],
  "flag-br": [
    31,
    42
  ],
  "flag-bs": [
    31,
    43
  ],
  "flag-bt": [
    31,
    44
  ],
  "flag-bv": [
    31,
    45
  ],
  "flag-bw": [
    31,
    46
  ],
  "flag-by": [
    31,
    47
  ],
  "flag-bz": [
    31,
    48
  ],
  "flag-ca": [
    32,
    0
  ],
  "flag-cc": [
    32,
    1
  ],
  "flag-cd": [
    32,
    2
  ],
  "flag-cf": [
    32,
    3
  ],
  "flag-cg": [
    32,
    4
  ],
  "flag-ch": [
    32,
    5
  ],
  "flag-ci": [
    32,
    6
  ],
  "flag-ck": [
    32,
    7
  ],
  "flag-cl": [
    32,
    8
  ],
  "flag-cm": [
    32,
    9
  ],
  "flag-cn": [
    32,
    10
  ],
  "flag-co": [
    32,
    11
  ],
  "flag-cp": [
    32,
    12
  ],
  "flag-cr": [
    32,
    13
  ],
  "flag-cu": [
    32,
    14
  ],
  "flag-cv": [
    32,
    15
  ],
  "flag-cw": [
    32,
    16
  ],
  "flag-cx": [
    32,
    17
  ],
  "flag-cy": [
    32,
    18
  ],
  "flag-cz": [
    32,
    19
  ],
  "flag-de": [
    32,
    20
  ],
  "flag-dg": [
    32,
    21
  ],
  "flag-dj": [
    32,
    22
  ],
  "flag-dk": [
    32,
    23
  ],
  "flag-dm": [
    32,
    24
  ],
  "flag-do": [
    32,
    25
  ],
  "flag-dz": [
    32,
    26
  ],
  "flag-ea": [
    32,
    27
  ],
  "flag-ec": [
    32,
    28
  ],
  "flag-ee": [
    32,
    29
  ],
  "flag-eg": [
    32,
    30
  ],
  "flag-eh": [
    32,
    31
  ],
  "flag-er": [
    32,
    32
  ],
  "flag-es": [
    32,
    33
  ],
  "flag-et": [
    32,
    34
  ],
  "flag-eu": [
    32,
    35
  ],
  "flag-fi": [
    32,
    36
  ],
  "flag-fj": [
    32,
    37
  ],
  "flag-fk": [
    32,
    38
  ],
  "flag-fm": [
    32,
    39
  ],
  "flag-fo": [
    32,
    40
  ],
  "flag-fr": [
    32,
    41
  ],
  "flag-ga": [
    32,
    42
  ],
  "flag-gb": [
    32,
    43
  ],
  "flag-gd": [
    32,
    44
  ],
  "flag-ge": [
    32,
    45
  ],
  "flag-gf": [
    32,
    46
  ],
  "flag-gg": [
    32,
    47
  ],
  "flag-gh": [
    32,
    48
  ],
  "flag-gi": [
    33,
    0
  ],
  "flag-gl": [
    33,
    1
  ],
  "flag-gm": [
    33,
    2
  ],
  "flag-gn": [
    33,
    3
  ],
  "flag-gp": [
    33,
    4
  ],
  "flag-gq": [
    33,
    5
  ],
  "flag-gr": [
    33,
    6
  ],
  "flag-gs": [
    33,
    7
  ],
  "flag-gt": [
    33,
    8
  ],
  "flag-gu": [
    33,
    9
  ],
  "flag-gw": [
    33,
    10
  ],
  "flag-gy": [
    33,
    11
  ],
  "flag-hk": [
    33,
    12
  ],
  "flag-hm": [
    33,
    13
  ],
  "flag-hn": [
    33,
    14
  ],
  "flag-hr": [
    33,
    15
  ],
  "flag-ht": [
    33,
    16
  ],
  "flag-hu": [
    33,
    17
  ],
  "flag-ic": [
    33,
    18
  ],
  "flag-id": [
    33,
    19
  ],
  "flag-ie": [
    33,
    20
  ],
  "flag-il": [
    33,
    21
  ],
  "flag-im": [
    33,
    22
  ],
  "flag-in": [
    33,
    23
  ],
  "flag-io": [
    33,
    24
  ],
  "flag-iq": [
    33,
    25
  ],
  "flag-ir": [
    33,
    26
  ],
  "flag-is": [
    33,
    27
  ],
  "flag-it": [
    33,
    28
  ],
  "flag-je": [
    33,
    29
  ],
  "flag-jm": [
    33,
    30
  ],
  "flag-jo": [
    33,
    31
  ],
  "flag-jp": [
    33,
    32
  ],
  "flag-ke": [
    33,
    33
  ],
  "flag-kg": [
    33,
    34
  ],
  "flag-kh": [
    33,
    35
  ],
  "flag-ki": [
    33,
    36
  ],
  "flag-km": [
    33,
    37
  ],
  "flag-kn": [
    33,
    38
  ],
  "flag-kp": [
    33,
    39
  ],
  "flag-kr": [
    33,
    40
  ],
  "flag-kw": [
    33,
    41
  ],
  "flag-ky": [
    33,
    42
  ],
  "flag-kz": [
    33,
    43
  ],
  "flag-la": [
    33,
    44
  ],
  "flag-lb": [
    33,
    45
  ],
  "flag-lc": [
    33,
    46
  ],
  "flag-li": [
    33,
    47
  ],
  "flag-lk": [
    33,
    48
  ],
  "flag-lr": [
    34,
    0
  ],
  "flag-ls": [
    34,
    1
  ],
  "flag-lt": [
    34,
    2
  ],
  "flag-lu": [
    34,
    3
  ],
  "flag-lv": [
    34,
    4
  ],
  "flag-ly": [
    34,
    5
  ],
  "flag-ma": [
    34,
    6
  ],
  "flag-mc": [
    34,
    7
  ],
  "flag-md": [
    34,
    8
  ],
  "flag-me": [
    34,
    9
  ],
  "flag-mf": [
    34,
    10
  ],
  "flag-mg": [
    34,
    11
  ],
  "flag-mh": [
    34,
    12
  ],
  "flag-mk": [
    34,
    13
  ],
  "flag-ml": [
    34,
    14
  ],
  "flag-mm": [
    34,
    15
  ],
  "flag-mn": [
    34,
    16
  ],
  "flag-mo": [
    34,
    17
  ],
  "flag-mp": [
    34,
    18
  ],
  "flag-mq": [
    34,
    19
  ],
  "flag-mr": [
    34,
    20
  ],
  "flag-ms": [
    34,
    21
  ],
  "flag-mt": [
    34,
    22
  ],
  "flag-mu": [
    34,
    23
  ],
  "flag-mv": [
    34,
    24
  ],
  "flag-mw": [
    34,
    25
  ],
  "flag-mx": [
    34,
    26
  ],
  "flag-my": [
    34,
    27
  ],
  "flag-mz": [
    34,
    28
  ],
  "flag-na": [
    34,
    29
  ],
  "flag-nc": [
    34,
    30
  ],
  "flag-ne": [
    34,
    31
  ],
  "flag-nf": [
    34,
    32
  ],
  "flag-ng": [
    34,
    33
  ],
  "flag-ni": [
    34,
    34
  ],
  "flag-nl": [
    34,
    35
  ],
  "flag-no": [
    34,
    36
  ],
  "flag-np": [
    34,
    37
  ],
  "flag-nr": [
    34,
    38
  ],
  "flag-nu": [
    34,
    39
  ],
  "flag-nz": [
    34,
    40
  ],
  "flag-om": [
    34,
    41
  ],
  "flag-pa": [
    34,
    42
  ],
  "flag-pe": [
    34,
    43
  ],
  "flag-pf": [
    34,
    44
  ],
  "flag-pg": [
    34,
    45
  ],
  "flag-ph": [
    34,
    46
  ],
  "flag-pk": [
    34,
    47
  ],
  "flag-pl": [
    34,
    48
  ],
  "flag-pm": [
    35,
    0
  ],
  "flag-pn": [
    35,
    1
  ],
  "flag-pr": [
    35,
    2
  ],
  "flag-ps": [
    35,
    3
  ],
  "flag-pt": [
    35,
    4
  ],
  "flag-pw": [
    35,
    5
  ],
  "flag-py": [
    35,
    6
  ],
  "flag-qa": [
    35,
    7
  ],
  "flag-re": [
    35,
    8
  ],
  "flag-ro": [
    35,
    9
  ],
  "flag-rs": [
    35,
    10
  ],
  "flag-ru": [
    35,
    11
  ],
  "flag-rw": [
    35,
    12
  ],
  "flag-sa": [
    35,
    13
  ],
  "flag-sb": [
    35,
    14
  ],
  "flag-sc": [
    35,
    15
  ],
  "flag-sd": [
    35,
    16
  ],
  "flag-se": [
    35,
    17
  ],
  "flag-sg": [
    35,
    18
  ],
  "flag-sh": [
    35,
    19
  ],
  "flag-si": [
    35,
    20
  ],
  "flag-sj": [
    35,
    21
  ],
  "flag-sk": [
    35,
    22
  ],
  "flag-sl": [
    35,
    23
  ],
  "flag-sm": [
    35,
    24
  ],
  "flag-sn": [
    35,
    25
  ],
  "flag-so": [
    35,
    26
  ],
  "flag-sr": [
    35,
    27
  ],
  "flag-ss": [
    35,
    28
  ],
  "flag-st": [
    35,
    29
  ],
  "flag-sv": [
    35,
    30
  ],
  "flag-sx": [
    35,
    31
  ],
  "flag-sy": [
    35,
    32
  ],
  "flag-sz": [
    35,
    33
  ],
  "flag-ta": [
    35,
    34
  ],
  "flag-tc": [
    35,
    35
  ],
  "flag-td": [
    35,
    36
  ],
  "flag-tf": [
    35,
    37
  ],
  "flag-tg": [
    35,
    38
  ],
  "flag-th": [
    35,
    39
  ],
  "flag-tj": [
    35,
    40
  ],
  "flag-tk": [
    35,
    41
  ],
  "flag-tl": [
    35,
    42
  ],
  "flag-tm": [
    35,
    43
  ],
  "flag-tn": [
    35,
    44
  ],
  "flag-to": [
    35,
    45
  ],
  "flag-tr": [
    35,
    46
  ],
  "flag-tt": [
    35,
    47
  ],
  "flag-tv": [
    35,
    48
  ],
  "flag-tw": [
    36,
    0
  ],
  "flag-tz": [
    36,
    1
  ],
  "flag-ua": [
    36,
    2
  ],
  "flag-ug": [
    36,
    3
  ],
  "flag-um": [
    36,
    4
  ],
  "flag-un": [
    36,
    5
  ],
  "flag-us": [
    36,
    6
  ],
  "flag-uy": [
    36,
    7
  ],
  "flag-uz": [
    36,
    8
  ],
  "flag-va": [
    36,
    9
  ],
  "flag-vc": [
    36,
    10
  ],
  "flag-ve": [
    36,
    11
  ],
  "flag-vg": [
    36,
    12
  ],
  "flag-vi": [
    36,
    13
  ],
  "flag-vn": [
    36,
    14
  ],
  "flag-vu": [
    36,
    15
  ],
  "flag-wf": [
    36,
    16
  ],
  "flag-ws": [
    36,
    17
  ],
  "flag-xk": [
    36,
    18
  ],
  "flag-ye": [
    36,
    19
  ],
  "flag-yt": [
    36,
    20
  ],
  "flag-za": [
    36,
    21
  ],
  "flag-zm": [
    36,
    22
  ],
  "flag-zw": [
    36,
    23
  ],
  "male-farmer": [
    36,
    24
  ],
  "male-cook": [
    36,
    30
  ],
  "male-student": [
    36,
    36
  ],
  "male-singer": [
    36,
    42
  ],
  "male-artist": [
    36,
    48
  ],
  "male-teacher": [
    37,
    5
  ],
  "male-factory-worker": [
    37,
    11
  ],
  "man-boy": [
    37,
    17
  ],
  "man-girl": [
    37,
    18
  ],
  "male-technologist": [
    37,
    19
  ],
  "male-office-worker": [
    37,
    25
  ],
  "male-mechanic": [
    37,
    31
  ],
  "male-scientist": [
    37,
    37
  ],
  "male-astronaut": [
    37,
    43
  ],
  "male-firefighter": [
    38,
    0
  ],
  "female-farmer": [
    38,
    6
  ],
  "female-cook": [
    38,
    12
  ],
  "female-student": [
    38,
    18
  ],
  "female-singer": [
    38,
    24
  ],
  "female-artist": [
    38,
    30
  ],
  "female-teacher": [
    38,
    36
  ],
  "female-factory-worker": [
    38,
    42
  ],
  "woman-boy": [
    38,
    48
  ],
  "woman-girl": [
    39,
    0
  ],
  "female-technologist": [
    39,
    1
  ],
  "female-office-worker": [
    39,
    7
  ],
  "female-mechanic": [
    39,
    13
  ],
  "female-scientist": [
    39,
    19
  ],
  "female-astronaut": [
    39,
    25
  ],
  "female-firefighter": [
    39,
    31
  ],
  "woman-running": [
    39,
    37
  ],
  "man-running": [
    39,
    43
  ],
  "woman-surfing": [
    40,
    0
  ],
  "man-surfing": [
    40,
    6
  ],
  "woman-swimming": [
    40,
    12
  ],
  "man-swimming": [
    40,
    18
  ],
  "woman-lifting-weights": [
    40,
    24
  ],
  "man-lifting-weights": [
    40,
    30
  ],
  "woman-golfing": [
    40,
    36
  ],
  "man-golfing": [
    40,
    42
  ],
  "rainbow-flag": [
    40,
    48
  ],
  "eye-in-speech-bubble": [
    41,
    0
  ],
  "man-boy-boy": [
    41,
    1
  ],
  "man-girl-boy": [
    41,
    2
  ],
  "man-girl-girl": [
    41,
    3
  ],
  "man-man-boy": [
    41,
    4
  ],
  "man-man-boy-boy": [
    41,
    5
  ],
  "man-man-girl": [
    41,
    6
  ],
  "man-man-girl-boy": [
    41,
    7
  ],
  "man-man-girl-girl": [
    41,
    8
  ],
  "man-woman-boy": [
    41,
    9
  ],
  "man-woman-boy-boy": [
    41,
    10
  ],
  "man-woman-girl": [
    41,
    11
  ],
  "man-woman-girl-boy": [
    41,
    12
  ],
  "man-woman-girl-girl": [
    41,
    13
  ],
  "male-doctor": [
    41,
    14
  ],
  "male-judge": [
    41,
    20
  ],
  "male-pilot": [
    41,
    26
  ],
  "man-heart-man": [
    41,
    32
  ],
  "man-kiss-man": [
    41,
    33
  ],
  "woman-boy-boy": [
    41,
    34
  ],
  "woman-girl-boy": [
    41,
    35
  ],
  "woman-girl-girl": [
    41,
    36
  ],
  "woman-woman-boy": [
    41,
    37
  ],
  "woman-woman-boy-boy": [
    41,
    38
  ],
  "woman-woman-girl": [
    41,
    39
  ],
  "woman-woman-girl-boy": [
    41,
    40
  ],
  "woman-woman-girl-girl": [
    41,
    41
  ],
  "female-doctor": [
    41,
    42
  ],
  "female-judge": [
    41,
    48
  ],
  "female-pilot": [
    42,
    5
  ],
  "woman-heart-man": [
    42,
    11
  ],
  "woman-heart-woman": [
    42,
    12
  ],
  "woman-kiss-man": [
    42,
    13
  ],
  "woman-kiss-woman": [
    42,
    14
  ],
  "female-police-officer": [
    42,
    15
  ],
  "male-police-officer": [
    42,
    21
  ],
  "woman-with-bunny-ears-partying": [
    42,
    27
  ],
  "man-with-bunny-ears-partying": [
    42,
    28
  ],
  "blond-haired-woman": [
    42,
    29
  ],
  "blond-haired-man": [
    42,
    35
  ],
  "woman-wearing-turban": [
    42,
    41
  ],
  "man-wearing-turban": [
    42,
    47
  ],
  "female-construction-worker": [
    43,
    4
  ],
  "male-construction-worker": [
    43,
    10
  ],
  "woman-tipping-hand": [
    43,
    16
  ],
  "man-tipping-hand": [
    43,
    22
  ],
  "female-guard": [
    43,
    28
  ],
  "male-guard": [
    43,
    34
  ],
  "woman-getting-massage": [
    43,
    40
  ],
  "man-getting-massage": [
    43,
    46
  ],
  "woman-getting-haircut": [
    44,
    3
  ],
  "man-getting-haircut": [
    44,
    9
  ],
  "female-detective": [
    44,
    15
  ],
  "male-detective": [
    44,
    21
  ],
  "woman-gesturing-no": [
    44,
    27
  ],
  "man-gesturing-no": [
    44,
    33
  ],
  "woman-gesturing-ok": [
    44,
    39
  ],
  "man-gesturing-ok": [
    44,
    45
  ],
  "woman-bowing": [
    45,
    2
  ],
  "man-bowing": [
    45,
    8
  ],
  "woman-raising-hand": [
    45,
    14
  ],
  "man-raising-hand": [
    45,
    20
  ],
  "woman-frowning": [
    45,
    26
  ],
  "man-frowning": [
    45,
    32
  ],
  "woman-pouting": [
    45,
    38
  ],
  "man-pouting": [
    45,
    44
  ],
  "woman-rowing-boat": [
    46,
    1
  ],
  "man-rowing-boat": [
    46,
    7
  ],
  "woman-biking": [
    46,
    13
  ],
  "man-biking": [
    46,
    19
  ],
  "woman-mountain-biking": [
    46,
    25
  ],
  "man-mountain-biking": [
    46,
    31
  ],
  "woman-walking": [
    46,
    37
  ],
  "man-walking": [
    46,
    43
  ],
  "woman-facepalming": [
    47,
    0
  ],
  "man-facepalming": [
    47,
    6
  ],
  "woman-shrugging": [
    47,
    12
  ],
  "man-shrugging": [
    47,
    18
  ],
  "woman-cartwheeling": [
    47,
    24
  ],
  "man-cartwheeling": [
    47,
    30
  ],
  "woman-juggling": [
    47,
    36
  ],
  "man-juggling": [
    47,
    42
  ],
  "woman-wrestling": [
    47,
    48
  ],
  "man-wrestling": [
    48,
    0
  ],
  "woman-playing-water-polo": [
    48,
    1
  ],
  "man-playing-water-polo": [
    48,
    7
  ],
  "woman-playing-handball": [
    48,
    13
  ],
  "man-playing-handball": [
    48,
    19
  ],
  "woman-bouncing-ball": [
    48,
    25
  ],
  "man-bouncing-ball": [
    48,
    31
  ]
};
