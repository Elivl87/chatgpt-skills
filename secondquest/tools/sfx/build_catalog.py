#!/usr/bin/env python3
"""Build public/shared/sfx/CATALOG.json + CATALOG.md (and the licence files next to every pack, and the generated
pack table in SOURCES.md) from what is on disk.

  python3 tools/sfx/build_catalog.py

Every audio file under public/shared/sfx (root synths, own/, cc0/, ccby/) gets: category, tags, tier, duration,
peak, loudness (K-weighted, BS.1770 style), spectral centroid / flatness / attack / decay, a one-line description
derived from those measures ("listening proxy"), the pack and its licence. The picker (scripts/sfx_pick.py) reads it.
"""
import json
import re
from datetime import date
from pathlib import Path

import numpy as np
import scipy.signal as ss
import soundfile as sf

ROOT = Path(__file__).resolve().parents[2]
SFX = ROOT / 'public/shared/sfx'
LIC_DIR = SFX / 'LICENSES'
SR = 48000
OGA = 'https://opengameart.org/content/'
KEN = 'https://kenney.nl/assets/'

# ------------------------------------------------------------------ sources (licence verified on each page, 2026-10-14)
# folder -> (pack name, author, url, licence, attribution text or None, default tier)
SOURCES = {
    'kenney': ('Kenney audio packs (older subset)', 'Kenney', KEN, 'CC0-1.0', None, 'premium'),
    'kenney_interface': ('Interface Sounds', 'Kenney', KEN + 'interface-sounds', 'CC0-1.0', None, 'premium'),
    'kenney_impact': ('Impact Sounds', 'Kenney', KEN + 'impact-sounds', 'CC0-1.0', None, 'premium'),
    'kenney_ui': ('UI Audio', 'Kenney', KEN + 'ui-audio', 'CC0-1.0', None, 'premium'),
    'kenney_rpg': ('RPG Audio', 'Kenney', KEN + 'rpg-audio', 'CC0-1.0', None, 'premium'),
    'kenney_casino': ('Casino Audio', 'Kenney', KEN + 'casino-audio', 'CC0-1.0', None, 'premium'),
    'kenney_digital': ('Digital Audio', 'Kenney', KEN + 'digital-audio', 'CC0-1.0', None, 'arcade'),
    'kenney_scifi': ('Sci-fi Sounds', 'Kenney', KEN + 'sci-fi-sounds', 'CC0-1.0', None, 'premium'),
    'kenney_jingles': ('Music Jingles', 'Kenney', KEN + 'music-jingles', 'CC0-1.0', None, 'premium'),
    'owlishmedia': ('87 Clickety Clips', 'OwlishMedia', OGA + '87-clickety-clips', 'CC0-1.0', None, 'premium'),
    'owlish_202': ('202 More Sound Effects', 'OwlishMedia', OGA + '202-more-sound-effects', 'CC0-1.0', None, 'premium'),
    'rubberduck_water': ('40 CC0 water / splash / slime SFX', 'rubberduck', OGA + '40-cc0-water-splash-slime-sfx', 'CC0-1.0', None, 'premium'),
    'rubberduck_100sfx': ('100 CC0 SFX', 'rubberduck', OGA + '100-cc0-sfx', 'CC0-1.0', None, 'premium'),
    'rubberduck_100sfx2': ('100 CC0 SFX #2', 'rubberduck', OGA + '100-cc0-sfx-2', 'CC0-1.0', None, 'premium'),
    'rubberduck_metalwood': ('100 CC0 metal and wood SFX', 'rubberduck', OGA + '100-cc0-metal-and-wood-sfx', 'CC0-1.0', None, 'premium'),
    'rubberduck_breaking': ('75 CC0 breaking / falling / hit sfx', 'rubberduck', OGA + '75-cc0-breaking-falling-hit-sfx', 'CC0-1.0', None, 'premium'),
    'rubberduck_bangs': ('25 CC0 bang / firework SFX', 'rubberduck', OGA + '25-cc0-bang-firework-sfx', 'CC0-1.0', None, 'premium'),
    'rubberduck_rpg': ('80 CC0 RPG SFX', 'rubberduck', OGA + '80-cc0-rpg-sfx', 'CC0-1.0', None, 'premium'),
    'rubberduck_creature': ('80 CC0 creature SFX', 'rubberduck', OGA + '80-cc0-creature-sfx', 'CC0-1.0', None, 'gag'),
    'rubberduck_creature2': ('80 CC0 creature SFX #2', 'rubberduck', OGA + '80-cc0-creture-sfx-2', 'CC0-1.0', None, 'gag'),
    'rubberduck_scifi50': ('50 CC0 Sci-Fi SFX', 'rubberduck', OGA + '50-cc0-sci-fi-sfx', 'CC0-1.0', None, 'premium'),
    'rubberduck_scifi60': ('60 CC0 Sci-Fi SFX', 'rubberduck', OGA + '60-cc0-sci-fi-sfx', 'CC0-1.0', None, 'premium'),
    'rubberduck_retro': ('50 CC0 retro / synth SFX', 'rubberduck', OGA + '50-cc0-retro-synth-sfx', 'CC0-1.0', None, 'arcade'),
    'rubberduck_loops': ('30 CC0 SFX loops', 'rubberduck', OGA + '30-cc0-sfx-loops', 'CC0-1.0', None, 'premium'),
    'rubberduck_weird': ('30 weird CC0 SFX', 'rubberduck', OGA + '30-weird-cc0-sfx', 'CC0-1.0', None, 'gag'),
    'rubberduck_mud': ('25 CC0 mud sfx', 'rubberduck', OGA + '25-cc0-mud-sfx', 'CC0-1.0', None, 'premium'),
    'juhani512': ('512 Sound Effects (8-bit style)', 'Juhani Junkala (SubspaceAudio)', OGA + '512-sound-effects-8-bit-style', 'CC0-1.0', None, 'arcade'),
    'artisticdude_swishes': ('Swishes Sound Pack', 'artisticdude', OGA + 'swishes-sound-pack', 'CC0-1.0', None, 'premium'),
    'artisticdude_rpg': ('RPG Sound Pack', 'artisticdude', OGA + 'rpg-sound-pack', 'CC0-1.0', None, 'premium'),
    'qubodup_hits': ('37 hits/punches', 'qubodup (independent.nu ljudbank)', OGA + '37-hitspunches', 'CC0-1.0', None, 'premium'),
    'qubodup_woodcracks': ('35 wooden cracks/hits/destructions', 'qubodup (independent.nu ljudbank)', OGA + '35-wooden-crackshitsdestructions', 'CC0-1.0', None, 'premium'),
    'qubodup_rustles': ('20 Rustles of dry leaves', 'qubodup', OGA + '20-rustles-dry-leaves', 'CC0-1.0', None, 'premium'),
    'qubodup_doors': ('Door Open, Door Close Set', 'qubodup', OGA + 'door-open-door-close-set', 'CC0-1.0', None, 'premium'),
    'qubodup_swooshes': ('Swish - bamboo stick weapon swhoshes', 'qubodup', OGA + 'swish-bamboo-stick-weapon-swhoshes', 'CC0-1.0', None, 'premium'),
    'qubodup_footsteps': ("Fantozzi's Footsteps (Grass/Sand & Stone)", 'qubodup / Fantozzi', OGA + 'fantozzis-footsteps-grasssand-stone', 'CC0-1.0', None, 'premium'),
    'qubodup_krank': ('Atmospheric Interaction Sound Pack', 'qubodup', OGA + 'atmospheric-interaction-sound-pack', 'CC0-1.0', None, 'premium'),
    'qubodup_buttons': ('16 button clicks', 'qubodup (independent.nu ljudbank)', OGA + '16-button-clicks', 'CC0-1.0', None, 'premium'),
    'qubodup_clickui': ('Click UI Menu SFX (yes/no/select)', 'qubodup', OGA + 'click-ui-menu-sfx-yesnoselect', 'CC0-1.0', None, 'premium'),
    'qubodup_snowgravel': ('42 Snow and Gravel Footsteps', 'qubodup / Corsica_S', OGA + '42-snow-and-gravel-footsteps', 'CC0-1.0', None, 'premium'),
    'qubodup_snowdry': ('4 dry snow steps', 'qubodup', OGA + '4-dry-snow-steps', 'CC0-1.0', None, 'premium'),
    'qubodup_jumpland': ('Jump Landing Sound', 'qubodup', OGA + 'jump-landing-sound', 'CC0-1.0', None, 'premium'),
    'qubodup_items': ('Item Shortcut Sound Pack', 'qubodup', OGA + 'item-shortcut-sound-pack', 'CC0-1.0', None, 'premium'),
    'qubodup_waves': ('Beach Ocean Waves', 'qubodup / jasinski', OGA + 'beach-ocean-waves', 'CC0-1.0', None, 'premium'),
    'wubitog_pops': ('3 Pop Sounds', 'wubitog', OGA + '3-pop-sounds', 'CC0-1.0', None, 'premium'),
    'bart_squeak': ('Squeak toy sounds', 'bart', OGA + 'squeak-toy-sounds', 'CC0-1.0', None, 'premium'),
    'bart_steam': ('Steam release sounds', 'bart', OGA + 'steam-release-sounds', 'CC0-1.0', None, 'premium'),
    'bart_beeps': ('Interface beeps', 'bart', OGA + 'interface-beeps', 'CC0-1.0', None, 'arcade'),
    'bart_clock': ('Ticking clock', 'bart', OGA + 'ticking-clock', 'CC0-1.0', None, 'premium'),
    'voltiment_bookflip': ('Book Flip Sounds', 'Voltiment555', OGA + 'book-flip-sounds', 'CC0-1.0', None, 'premium'),
    'ogrebane_woodmetal2': ('Wood and Metal Sound Effects: Volume 2', 'Ogrebane', OGA + 'wood-and-metal-sound-effects-volume-2', 'CC0-1.0', None, 'premium'),
    'antum_scrapes': ('Scrapes', 'AntumDeluge', OGA + 'scrapes', 'CC0-1.0', None, 'premium'),
    'antum_zipper': ('Zipper', 'AntumDeluge', OGA + 'zipper', 'CC0-1.0', None, 'premium'),
    'antum_xylophone': ("Children's Xylophone", 'AntumDeluge', OGA + 'childrens-xylophone', 'CC0-1.0', None, 'premium'),
    'tokyogeisha_58': ('58 Random Sound Effects', 'TokyoGeisha', OGA + '58-random-sound-effects', 'CC0-1.0', None, 'premium'),
    'wobbleboxx_levelup': ('Level up, power up, Coin get (13 Sounds)', 'wobbleboxx', OGA + 'level-up-power-up-coin-get-13-sounds', 'CC0-1.0', None, 'arcade'),
    'haeldb_cards': ('Card Game sounds', 'HaelDB', OGA + 'card-game-sounds', 'CC0-1.0 (dual OGA-BY/CC0 where listed; we use CC0)', None, 'premium'),
    'haeldb_footsteps': ('Footsteps Leather, Cloth, Armor', 'HaelDB', OGA + 'footsteps-leather-cloth-armor', 'CC0-1.0 (dual OGA-BY 3.0 / CC0; we use CC0)', None, 'premium'),
    'someoneman_cure': ('Cure Magic', 'Someoneman', OGA + 'cure-magic', 'CC0-1.0', None, 'premium'),
    'jaggedstone_magic': ('Magic Spell SFX', 'JaggedStone', OGA + 'magic-spell-sfx', 'CC0-1.0', None, 'premium'),
    'pwl_bells': ('Bell dings/chimes', 'PWL', OGA + 'bell-dingschimes', 'CC0-1.0', None, 'premium'),
    'springspring_bell': ('Pleasing Bell Sound Effect', 'Spring Spring', OGA + 'pleasing-bell-sound-effect', 'CC0-1.0', None, 'premium'),
    'pyrano_whoosh': ('Air whoosh', 'pyranostudios', OGA + 'air-whoosh', 'CC0-1.0', None, 'premium'),
    'sketchman_windwhoosh': ('wind whoosh loop', 'SketchMan3', OGA + 'wind-whoosh-loop', 'CC0-1.0', None, 'premium'),
    'mikeask_steps': ('Steps in wood floor', 'mikeask', OGA + 'steps-in-wood-floor', 'CC0-1.0', None, 'premium'),
    'themightyglider_camera': ('Camera', 'themightyglider', OGA + 'camera', 'CC0-1.0', None, 'premium'),
    'ylmir_rain': ('Rain (loopable)', 'Ylmir', OGA + 'rain-loopable', 'CC0-1.0', None, 'premium'),
    'isaiah_birds': ('Ambient Bird Sounds', 'isaiah658', OGA + 'ambient-bird-sounds', 'CC0-1.0', None, 'premium'),
    'pauliuw_forestbirds': ('Forest bird sounds', 'pauliuw', OGA + 'forest-bird-sounds', 'CC0-1.0', None, 'premium'),
    'pauliuw_voices': ('Background voices', 'pauliuw', OGA + 'background-voices', 'CC0-1.0', None, 'premium'),
    'kresiek_morning': ('AMB Morning Sounds (Perfect Loop)', 'Kresiek The Furry', OGA + 'amb-morning-sounds-perfect-loop', 'CC0-1.0', None, 'premium'),
    'kresiek_outside': ('AMB Outside 1', 'Kresiek The Furry', OGA + 'amb-outside-1', 'CC0-1.0', None, 'premium'),
    'thimras_park': ('Park ambiences', 'Thimras', OGA + 'park-ambiences', 'CC0-1.0', None, 'premium'),
    'wolfgang_crickets': ('Crickets Ambient Noise - loopable', 'Wolfgang_', OGA + 'crickets-ambient-noise-loopable', 'CC0-1.0', None, 'premium'),
    'lokif_swamp': ('Swamp Environment Audio', 'LokiF', OGA + 'swamp-environment-audio', 'CC0-1.0', None, 'premium'),
    'lokif_gui': ('GUI Sound Effects', 'LokiF', OGA + 'gui-sound-effects', 'CC0-1.0', None, 'premium'),
    'expl0it3r_applause': ('Applause in a large hall or church', 'eXpl0it3r', OGA + 'applause-in-a-large-hall-or-church', 'CC0-1.0', None, 'premium'),
    'starninjas_crowd': ('Crowd Shouting/Speaking Ambience', 'StarNinjas', OGA + 'crowd-shoutingspeaking-ambience', 'CC0-1.0', None, 'premium'),
    'nocturnal_giggle': ('Group giggling', 'Nocturnal_Vanguard', OGA + 'group-giggling', 'CC0-1.0', None, 'premium'),
    'yaroslav_children': ('Children voices', 'Yaroslav_Novikov', OGA + 'children-voices', 'CC0-1.0', None, 'premium'),
    'rpg_dice': ('2 dice roll (29 throws)', 'RPG (OGA user)', OGA + '2-dice-roll-29-throws', 'CC0-1.0', None, 'premium'),
    'derived': ('Edits of the CC0 files above', 'SecondQuest', '', 'CC0-1.0', None, 'premium'),
    'lrsf_ui': ('UI Sound Effects Library', 'Little Robot Sound Factory', OGA + 'ui-sound-effects-library', 'CC-BY-3.0',
                'Sound effects: "UI Sound Effects Library" by Little Robot Sound Factory (www.littlerobotsoundfactory.com), CC BY 3.0', 'premium'),
    'lrsf_fantasy': ('Fantasy Sound Effects Library', 'Little Robot Sound Factory', OGA + 'fantasy-sound-effects-library', 'CC-BY-3.0',
                     'Sound effects: "Fantasy Sound Effects Library" by Little Robot Sound Factory (www.littlerobotsoundfactory.com), CC BY 3.0', 'premium'),
}
OWN = ('SecondQuest own synthesis', 'SecondQuest', '', 'own', None, 'premium')

# ------------------------------------------------------------------ categories
CATEGORIES = {
    'whoosh': 'air passes, swishes, swipes, UI slides',
    'impact-soft': 'soft hits, thumps, punches, landings',
    'impact-heavy': 'big hits, slams, crashes, rock breaks',
    'click-ui': 'clicks, taps, toggles, buttons, menu ticks',
    'notify-tech': 'notifications, confirm/error tones, beeps, phone, camera, computer',
    'pop': 'pops, bloops, plops, bubbles, mouth pops',
    'cartoon-comedy': 'boings, slide whistles, squeaks, pizzicato plucks, weird/funny',
    'foley-cloth': 'cloth, leather, velcro, zipper, leaf rustles',
    'foley-footstep': 'footsteps on wood, grass, snow, stone, landings',
    'foley-water': 'splashes, drips, drinks, mud, slime',
    'foley-wood': 'wood knocks, planks, cracks, wooden boxes',
    'foley-metal': 'metal hits, pots, chains, tools, blades',
    'foley-paper': 'paper, books, pages, stationery',
    'foley-glass': 'glass clinks, bottles, breaking glass',
    'foley-misc': 'kitchen, plastic, steam, scrapes, clock, items',
    'door': 'doors, locks, latches, keys, creaks',
    'coins-money': 'coins, chips, money handling',
    'cards-dice': 'cards, dice',
    'magic-sparkle': 'chimes, sparkles, spells, magical shimmers',
    'chime-bell': 'single bells, dings, gongs',
    'riser-swell': 'risers, reverse swells into a cut',
    'musical-sting': 'short musical jingles and stings',
    'nature-ambience': 'birds, rain, wind, water, crickets, swamp, waves (beds)',
    'ambience-tech': 'machines, engines, highway, construction (beds)',
    'crowd-reaction': 'applause, crowd, giggles, children, voices',
    'creature': 'creature/monster vocal sounds',
    'explosion-boom': 'explosions, bangs, fireworks, thunder',
    'scifi': 'sci-fi tones, lasers, engines, force fields',
    'retro-8bit': '8-bit / chiptune game sounds (only when the gag calls for it)',
}

FOLDER_CAT = {
    'artisticdude_swishes': 'whoosh', 'qubodup_swooshes': 'whoosh', 'pyrano_whoosh': 'whoosh',
    'qubodup_woodcracks': 'foley-wood', 'qubodup_rustles': 'foley-cloth', 'qubodup_doors': 'door',
    'qubodup_footsteps': 'foley-footstep', 'mikeask_steps': 'foley-footstep', 'qubodup_snowgravel': 'foley-footstep',
    'qubodup_snowdry': 'foley-footstep', 'qubodup_jumpland': 'foley-footstep', 'haeldb_footsteps': 'foley-footstep',
    'qubodup_krank': 'scifi', 'jaggedstone_magic': 'magic-sparkle', 'someoneman_cure': 'magic-sparkle',
    'pwl_bells': 'chime-bell', 'springspring_bell': 'chime-bell', 'wubitog_pops': 'pop', 'bart_squeak': 'cartoon-comedy',
    'bart_steam': 'foley-misc', 'bart_beeps': 'notify-tech', 'bart_clock': 'foley-misc', 'themightyglider_camera': 'notify-tech',
    'antum_scrapes': 'foley-misc', 'antum_zipper': 'foley-cloth', 'antum_xylophone': 'musical-sting',
    'voltiment_bookflip': 'foley-paper', 'rpg_dice': 'cards-dice', 'haeldb_cards': 'cards-dice',
    'juhani512': 'retro-8bit', 'rubberduck_retro': 'retro-8bit', 'kenney_digital': 'retro-8bit',
    'wobbleboxx_levelup': 'musical-sting', 'kenney_jingles': 'musical-sting', 'rubberduck_scifi50': 'scifi',
    'rubberduck_scifi60': 'scifi', 'rubberduck_creature': 'creature', 'rubberduck_creature2': 'creature',
    'rubberduck_weird': 'cartoon-comedy', 'qubodup_buttons': 'click-ui', 'qubodup_clickui': 'click-ui',
    'lokif_gui': 'click-ui', 'qubodup_items': 'foley-misc', 'qubodup_waves': 'nature-ambience',
    'lokif_swamp': 'nature-ambience', 'ylmir_rain': 'nature-ambience', 'kresiek_morning': 'nature-ambience',
    'kresiek_outside': 'nature-ambience', 'thimras_park': 'nature-ambience', 'pauliuw_forestbirds': 'nature-ambience',
    'isaiah_birds': 'nature-ambience', 'wolfgang_crickets': 'nature-ambience', 'sketchman_windwhoosh': 'nature-ambience',
    'pauliuw_voices': 'crowd-reaction', 'yaroslav_children': 'crowd-reaction', 'expl0it3r_applause': 'crowd-reaction',
    'starninjas_crowd': 'crowd-reaction', 'nocturnal_giggle': 'crowd-reaction', 'rubberduck_mud': 'foley-water',
    'rubberduck_bangs': 'explosion-boom', 'owlishmedia': 'click-ui', 'derived': 'click-ui',
    # own synthesis families
    'boing': 'cartoon-comedy', 'slide_up': 'cartoon-comedy', 'slide_down': 'cartoon-comedy', 'pluck_pizz': 'cartoon-comedy',
    'bloop': 'pop', 'chime_soft': 'magic-sparkle', 'sparkle': 'magic-sparkle', 'whoosh_soft': 'whoosh',
    'whoosh_fast': 'whoosh', 'riser': 'riser-swell', 'swell_reverse': 'riser-swell', 'tap_marimba': 'click-ui',
    'thump_soft': 'impact-soft',
}
ROOT_CAT = {
    'alarm': 'notify-tech', 'buzzer': 'notify-tech', 'cart_click': 'click-ui', 'cart_slide': 'foley-misc',
    'chime': 'magic-sparkle', 'crickets': 'nature-ambience', 'drain': 'riser-swell', 'fairy_flutter': 'magic-sparkle',
    'fairy_shimmer': 'magic-sparkle', 'impact': 'impact-heavy', 'keyboard': 'click-ui', 'money': 'coins-money',
    'notify': 'notify-tech', 'poof': 'pop', 'pop': 'pop', 'rumble': 'ambience-tech', 'sparkle': 'magic-sparkle',
    'stamp': 'impact-soft', 'tension': 'riser-swell', 'tractor': 'ambience-tech', 'tv_on': 'notify-tech',
    'ui_complete': 'notify-tech', 'ui_select': 'click-ui', 'whip': 'whoosh', 'whoosh': 'whoosh', 'wind': 'nature-ambience',
}
# (regex on "<folder>/<stem>" lower-case, category) - first match wins
RULES = [
    (r'lrsf_ui/slide', 'whoosh'), (r'lrsf_ui/mouth', 'pop?'), (r'lrsf_ui/click', 'click-ui'),
    (r'jingle', 'musical-sting'),
    (r'applause|crowd|giggl|children', 'crowd-reaction'),
    (r'loop_(water|rain)|/rain|water_flowing|water_boiling|ambience_cave|birds|forest', 'nature-ambience'),
    (r'loop_|/amb', 'ambience-tech'),
    (r'kenney_casino/chip|chips', 'coins-money'),
    (r'kenney_casino|card|dice|/die', 'cards-dice'),
    (r'kenney_interface/(confirmation|error|question|bong|glass|pluck|drop|glitch)', 'notify-tech'),
    (r'squeak|squeek|boing|spring|burp|tongue|nasal', 'cartoon-comedy'),
    (r'pop|plop|bubble|bloop|poof', 'pop'),
    (r'swish|swosh|swoosh|whoosh|swing|sfx100v2_air|whip', 'whoosh'),
    (r'footstep|/step|fantozzi|walking|landing', 'foley-footstep'),
    (r'cloth|velcro|zipper|rustle|leather|belt|armor|inventory_open|beads|chainmail', 'foley-cloth'),
    (r'splash|water|drink|mud|slime|drip|pour|fizz|toilet', 'foley-water'),
    (r'glass|bottle', 'foley-glass'),
    (r'paper|book|page|stationery|scissors|/rip|crunch', 'foley-paper'),
    (r'coin|money|gold|gem', 'coins-money'),
    (r'door|creak|lock|latch|keys?_|/keys', 'door'),
    (r'explosion|bang|cannon|/fw|boom|thunder|/shot', 'explosion-boom'),
    (r'spell|magic|cure|sparkle|shimmer|fairy|teleport|forcefield|powerup', 'magic-sparkle'),
    (r'bell|ding|gong|chime', 'chime-bell'),
    (r'creature|monster|mnstr|ogre|giant|shade|wolfman|goblin|dragon|roar|growl|alien|/bug', 'creature'),
    (r'click|tap|select|switch|toggle|tick|scroll|rollover|mouse|button|/back|close|open|maximize|minimize|keyboard|interface', 'click-ui'),
    (r'phone|camera|photo|beep|notify|alarm|terminal|computer', 'notify-tech'),
    (r'kenney_scifi|laser|engine|thruster|space', 'scifi'),
    (r'wood|plank|crack|chop', 'foley-wood'),
    (r'metal|tin|plate|pot|chain|sword|knife|blade|tools|hammer|anchor|mining|spoon|lighter', 'foley-metal'),
    (r'impact|hit|punch|thud|fall|break|slam|stone|rock|trap|stomp|soft', 'impact?'),
    (r'kitchen|plastic|fidget|steam|scrape|items|misc|machine|microwave|dishes|random|weird|sound|other|noise|clap|snip', 'foley-misc'),
]


# ------------------------------------------------------------------ analysis
def k_weight(x):
    # BS.1770 K-weighting at 48 kHz (pre-filter + RLB)
    b1, a1 = [1.53512485958697, -2.69169618940638, 1.19839281085285], [1.0, -1.69065929318241, 0.73248077421585]
    b2, a2 = [1.0, -2.0, 1.0], [1.0, -1.99004745483398, 0.99007225036621]
    return ss.lfilter(b2, a2, ss.lfilter(b1, a1, x, axis=-1), axis=-1)


def loudness(x):
    """integrated loudness with the absolute (-70) and relative (-10 LU) gates; short clips: one block"""
    y = k_weight(x)
    blk, hop = int(.4 * SR), int(.1 * SR)
    if y.shape[1] < blk:
        z = np.mean(y ** 2, axis=1).sum()
        return float(-0.691 + 10 * np.log10(z + 1e-12))
    zs = np.array([np.mean(y[:, i:i + blk] ** 2, axis=1).sum() for i in range(0, y.shape[1] - blk + 1, hop)])
    l = -0.691 + 10 * np.log10(zs + 1e-12)
    g = zs[l > -70]
    if not len(g):
        return -70.0
    rel = -0.691 + 10 * np.log10(g.mean()) - 10
    g2 = zs[(l > -70) & (l > rel)]
    return float(-0.691 + 10 * np.log10(g2.mean() + 1e-12))


def analyse(x):
    mono = ss.sosfilt(ss.butter(4, 70, 'high', fs=SR, output='sos'), x.mean(axis=0))   # ignore rumble/DC
    n = len(mono)
    dur = n / SR
    seg = mono[:min(n, 20 * SR)]
    if len(seg) < 4096:
        seg = np.concatenate([seg, np.zeros(4096 - len(seg))])
    f, t, Z = ss.stft(seg, SR, nperseg=2048, noverlap=1536)
    P = np.abs(Z) ** 2 + 1e-14
    w = P.sum(axis=0)
    act = w > w.max() * 1e-3
    cent = (f[:, None] * P).sum(axis=0) / P.sum(axis=0)
    centroid = float(np.average(cent[act], weights=w[act])) if act.any() else 0.0
    # tonality ("flatness" field kept for the catalog): 1 - harmonicity of the loudest 80 ms windows.
    # harmonicity = max normalised autocorrelation for pitches 60 Hz - 2 kHz; noise ~0.1, tones ~0.9
    win = int(.08 * SR)
    hs = []
    if len(seg) > win:
        rms = np.array([np.sqrt(np.mean(seg[i:i + win] ** 2)) for i in range(0, len(seg) - win, win // 2)])
        for j in np.argsort(rms)[::-1][:3]:
            fr = seg[j * win // 2: j * win // 2 + win] * np.hanning(win)
            ac = np.fft.irfft(np.abs(np.fft.rfft(fr, 2 * win)) ** 2)[:win]
            if ac[0] <= 0:
                continue
            lo, hi = SR // 2000, SR // 60
            hs.append(float(np.max(ac[lo:hi]) / ac[0]))
    flat = 1 - (float(np.mean(hs)) if hs else 0.0)
    # sweep: centroid trend across the active region
    ca = cent[act]
    sweep = 0.0
    if len(ca) > 6:
        k = len(ca) // 3
        sweep = float(np.log2((ca[-k:].mean() + 1) / (ca[:k].mean() + 1)))
    # amplitude envelope: 10 ms RMS frames
    hop = 480
    m = len(seg) // hop
    env = np.sqrt(np.mean(seg[:m * hop].reshape(m, hop) ** 2, axis=1)) if m else np.array([0.0])
    pk_i = int(np.argmax(env))
    pk = env[pk_i] + 1e-12
    attack = float(np.argmax(env >= pk * .5) * hop / SR)              # time to half the peak level
    after = env[pk_i:]
    below = np.where(after < pk * .1)[0]
    decay = float(below[0] * hop / SR) if len(below) else float(len(after) * hop / SR)
    # onsets: rises of > 12 dB inside 30 ms that reach -20 dB of the peak, at least 100 ms apart
    db = 20 * np.log10(env / pk + 1e-6)
    onsets, last = 0, -99
    for i in range(3, len(db)):
        if db[i] > -20 and db[i] - db[i - 3] > 12 and i - last >= 10:
            onsets += 1
            last = i
    onsets = max(1, onsets)
    peak = float(20 * np.log10(np.max(np.abs(x)) + 1e-12))
    return dict(duration=round(dur, 3), peak_db=round(peak, 1), lufs=round(loudness(x), 1),
                centroid_hz=int(centroid), flatness=round(flat, 3), attack_s=round(attack, 3),
                decay_s=round(decay, 3), sweep_oct=round(sweep, 2), onsets=onsets, channels=x.shape[0])


NOISY, GRAINY = .55, .25


def describe(a, cat):
    d = a['duration']
    size = 'tiny' if d < .15 else 'short' if d < .6 else 'medium' if d < 2 else 'long' if d < 8 else 'bed'
    c = a['centroid_hz']
    tone = 'dark' if c < 600 else 'warm' if c < 1500 else 'mid' if c < 3000 else 'bright' if c < 6000 else 'airy/very bright'
    tex = 'noisy' if a['flatness'] > NOISY else 'grainy' if a['flatness'] > GRAINY else 'tonal'
    att = 'sharp attack' if a['attack_s'] < .02 else 'soft attack' if a['attack_s'] < .25 else 'slow swell-in'
    dec = '' if d > 8 else ', quick decay' if a['decay_s'] < .15 else ', ringing tail' if a['decay_s'] > .8 else ''
    sw = ', rises' if a['sweep_oct'] > .6 else ', falls' if a['sweep_oct'] < -.6 else ''
    multi = f", {a['onsets']} hits" if 2 < a['onsets'] < 30 and d < 8 else ''
    return f'{size} {tex} {tone} ({c / 1000:.1f} kHz), {att}{dec}{sw}{multi}, {d:.2f} s'


def categorise(folder, stem, a):
    key = f'{folder}/{stem}'.lower()
    cat = FOLDER_CAT.get(folder)
    if folder == '':
        cat = ROOT_CAT.get(stem)
    if folder == 'rubberduck_loops' or (folder == 'rubberduck_100sfx2' and 'loop_' in key):
        cat = 'nature-ambience' if re.search(r'rain|water', key) else 'ambience-tech'
    if folder in ('kenney_scifi', 'rubberduck_scifi50') and re.search(r'explosion', key):
        cat = 'explosion-boom'
    if folder == 'pauliuw_voices':
        cat = 'crowd-reaction' if 'temple' in key else 'creature'
    if not cat:
        sk = '/' + stem.lower()
        for rx, c in RULES:
            if re.search(rx, key if re.match(r'^[a-z0-9_]+/', rx) else sk):
                cat = c
                break
    if cat == 'pop?':
        cat = 'pop' if a['duration'] < .35 and a['onsets'] <= 2 else 'cartoon-comedy'
    if cat == 'impact?' or (cat is None and a['flatness'] > .1 and a['duration'] < 1.2 and a['attack_s'] < .03):
        st = stem.lower()
        heavy = bool(re.search(r'heavy|break|slam|crash|stomp|rock', st)) or (a['centroid_hz'] < 1200 and a['decay_s'] > .3 and a['lufs'] > -20)
        cat = 'impact-heavy' if heavy else 'impact-soft'
    if cat is None:
        cat = 'notify-tech' if a['flatness'] < .05 and a['duration'] < 2 else 'foley-misc'
    if cat in ('nature-ambience', 'ambience-tech', 'crowd-reaction') and a['duration'] < 2.5 and folder.startswith('rubberduck'):
        pass
    return cat


def tags_for(folder, stem, cat, a):
    t = set(re.findall(r'[a-z]+', re.sub(r'([a-z])([A-Z])', r'\1 \2', stem).lower()))
    t = {w for w in t if len(w) > 2 and w not in ('sfx', 'ogg', 'wav')}
    if a['duration'] > 8 or cat in ('nature-ambience', 'ambience-tech'):
        t.add('bed')
    if 'loop' in stem.lower():
        t.add('loop')
    if a['sweep_oct'] > .6:
        t.add('rising')
    if a['sweep_oct'] < -.6:
        t.add('falling')
    return sorted(t)[:12]


# ------------------------------------------------------------------ licence files + SOURCES.md
def licence_files():
    cc0 = (LIC_DIR / 'CC0-1.0.txt').read_text()
    ccby = (LIC_DIR / 'CC-BY-3.0.txt').read_text()
    for folder, (name, author, url, lic, attrib, _) in SOURCES.items():
        d = SFX / ('ccby' if lic.startswith('CC-BY') else 'cc0') / folder
        if not d.is_dir():
            continue
        if folder in ('kenney', 'owlishmedia', 'rubberduck_water', 'derived'):
            continue                                                   # older folders keep their own licence file
        head = (f'Pack: {name}\nAuthor: {author}\nSource: {url}\nLicence: {lic}\n'
                f'Downloaded and converted (48 kHz Ogg Vorbis, trimmed, peak -1 dBFS) by SecondQuest on 2026-10-14.\n')
        if attrib:
            (d / 'LICENSE_CC-BY-3.0.txt').write_text(head + f'Attribution REQUIRED in the video description:\n  {attrib}\n\n' + ccby)
        else:
            (d / 'LICENSE_CC0.txt').write_text(head + 'Attribution: not required.\n\n' + cc0)


def sources_md(counts):
    md = SFX / 'SOURCES.md'
    txt = md.read_text()
    a, b = '<!-- PACKS:BEGIN (generated by tools/sfx/build_catalog.py) -->', '<!-- PACKS:END -->'
    rows = ['| Folder | Pack | Author | URL | Licence | Attribution needed | Files |', '|---|---|---|---|---|---|---|']
    for folder, (name, author, url, lic, attrib, tier) in SOURCES.items():
        lic_dir = 'ccby' if lic.startswith('CC-BY') else 'cc0'
        if not (SFX / lic_dir / folder).is_dir():
            continue
        rows.append(f'| `{lic_dir}/{folder}/` | {name} | {author} | {url or "-"} | {lic} | '
                    f'{("YES: " + attrib) if attrib else "no"} | {counts.get(folder, 0)} |')
    block = (f'{a}\n## Library packs (expansion 2026-10-14; every licence read on the pack page itself)\n\n'
             'All packs downloaded 2026-10-14 (Kenney and the older subsets: 2026-10-03 / 2026-10-12), each into its own empty '
             'folder; only audio + licence text kept, nothing executed; converted by `tools/sfx/import_packs.py`.\n'
             '`own/<family>/` is our own synthesis (`tools/sfx/own_library.py`, ours, free, no attribution).\n\n'
             + '\n'.join(rows) + '\n\n'
             '**CC-BY packs (`ccby/`)**: allowed (attribution only, no NC/ND/SA). When a video uses any file from `ccby/`, '
             'paste its attribution line into the video description; `scripts/sfx_pick.py` lists them (`Picker.attributions()`).\n\n'
             'Considered and skipped: Sonniss GDC bundles (licence fine: royalty-free, commercial, no attribution; but they are '
             'only distributed as multi-GB archives, no per-file subset, and disk is tight); freesound.org CC0 (downloads need '
             'a login/API key); "Well Done" (qubodup, file named CC-BY 3.0, page says CC0: unclear); circlerun Hi-Tech '
             'buttons (archive empty of audio); everything NC/ND/SA or "personal use only".\n'
             f'{b}')
    if a in txt:
        txt = re.sub(re.escape(a) + '.*?' + re.escape(b), lambda m: block, txt, flags=re.S)
    else:
        txt = txt.rstrip() + '\n\n' + block + '\n'
    md.write_text(txt)


# ------------------------------------------------------------------ main
def load(p):
    x, sr = sf.read(str(p), always_2d=True, dtype='float64')
    x = x.T
    if sr != SR:
        from math import gcd
        g = gcd(SR, sr)
        x = ss.resample_poly(x, SR // g, sr // g, axis=1)
    return x, sr


def main():
    licence_files()
    files = sorted(p for p in SFX.rglob('*') if p.suffix.lower() in ('.ogg', '.wav') and 'LICENSES' not in p.parts)
    entries, counts = [], {}
    for p in files:
        rel = p.relative_to(SFX).as_posix()
        parts = rel.split('/')
        if len(parts) == 1:
            folder, src = '', OWN
            pack = 'engine synths (scripts/placeholder-audio.ts)'
        elif parts[0] == 'own':
            folder = parts[1] if len(parts) > 2 else parts[1].rsplit('_', 1)[0]
            src = OWN
            pack = 'own/' + folder
        else:
            folder = parts[1]
            src = SOURCES.get(folder, ('?', '?', '', '?', None, 'premium'))
            pack = src[0]
        try:
            x, sr0 = load(p)
        except Exception as e:                                         # noqa
            print('skip', rel, e)
            continue
        a = analyse(x)
        stem = p.stem
        cat = categorise(folder, stem, a)
        tier = src[5]
        if folder == 'kenney_jingles' and 'nes' in stem.lower():
            tier = 'arcade'
        if folder == 'kenney_jingles' and 'nes' not in stem.lower():
            tier = 'premium'
        if folder == 'fairy_fly' or stem.startswith('fairy'):
            tier = 'premium'
        if cat == 'creature':
            tier = 'gag'
        e = dict(file=rel, category=cat, tags=tags_for(folder, stem, cat, a), tier=tier,
                 description=describe(a, cat), pack=pack, folder=folder or 'root',
                 licence=src[3], attribution=src[4], source_url=src[2], **a)
        if sr0 != SR:
            e['source_sr'] = sr0
        entries.append(e)
        counts[folder] = counts.get(folder, 0) + 1
    cats = {}
    for e in entries:
        cats.setdefault(e['category'], []).append(e)
    out = dict(generated=str(date.today()), sample_rate=SR, root='public/shared/sfx', count=len(entries),
               categories={c: dict(description=CATEGORIES.get(c, ''), count=len(cats.get(c, [])),
                                   premium=sum(1 for e in cats.get(c, []) if e['tier'] == 'premium'))
                           for c in CATEGORIES},
               files=entries)
    (SFX / 'CATALOG.json').write_text(json.dumps(out, indent=1, ensure_ascii=False))
    sources_md(counts)
    write_md(out, cats)
    print(len(entries), 'files catalogued')
    for c in CATEGORIES:
        print(f'  {c:18s} {len(cats.get(c, [])):5d}  premium {out["categories"][c]["premium"]:4d}')


def write_md(out, cats):
    size = sum(p.stat().st_size for p in SFX.rglob('*') if p.is_file()) / 1e6
    L = ['# SFX catalog', '',
         f'{out["count"]} sounds, {size:.0f} MB, 48 kHz (generated {out["generated"]} by `tools/sfx/build_catalog.py`; '
         'machine-readable: `CATALOG.json`). Licences: `SOURCES.md`. Picker with no-repeat + variation: `scripts/sfx_pick.py`.', '',
         'Tiers: **premium** (default for the picker), **gag** (creatures, weird; only for a comedy beat), '
         '**arcade** (8-bit/chiptune; only when the gag is "video game" on purpose).', '',
         '| Category | What | Files | Premium | Examples (pack) |', '|---|---|---:|---:|---|']
    for c, d in CATEGORIES.items():
        es = cats.get(c, [])
        prem = [e for e in es if e['tier'] == 'premium']
        packs = sorted({e['pack'] for e in prem or es})
        L.append(f'| `{c}` | {d} | {len(es)} | {len(prem)} | {", ".join(packs[:5])}{" …" if len(packs) > 5 else ""} |')
    L += ['', 'Each entry in `CATALOG.json`: `file, category, tags, tier, description, pack, licence, attribution, '
          'duration, peak_db, lufs, centroid_hz, flatness, attack_s, decay_s, sweep_oct, onsets`.',
          'Descriptions are a listening proxy from the measures (length, noisy/tonal, brightness, attack, decay, sweep).', '',
          '## Use', '', '```python', 'from sfx_pick import Picker            # scripts/sfx_pick.py',
          "pk = Picker(seed='ep004')            # one per video", "path = pk.file('whoosh', t=12.3)      # varied render (cached wav), never the same file twice within 20 s",
          "y = pk.layer('whoosh+foley-cloth', t=14.0)   # numpy stereo, layered", '```']
    (SFX / 'CATALOG.md').write_text('\n'.join(L) + '\n')


if __name__ == '__main__':
    main()
