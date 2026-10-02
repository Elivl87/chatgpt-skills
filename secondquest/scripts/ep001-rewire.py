#!/usr/bin/env python3
"""EP001 data-only scene rewire to V3 CLEAN FINAL_ART (Scene Rewire v2.3 + Creative Cast Delta v1).

  python3 scripts/ep001-rewire.py

Rewrites episodes/ep001full/scenes.json from the retired legacy scene data:
  1. legacy engine keys -> FINAL_ART keys (manifest `replaces` + hook_engine_key_map);
  2. retired full.* plates -> layered compositions of FINAL_ART assets (used_in M16–M46);
  3. rewire invariants: M11 detail -> wide, M13 three stations, M15 3.8 s identity beat,
     quest.tractor_heroic layered, ep001.email_icon programmatic, Creative Cast Delta.
No image is created or modified here: this only edits scene data.
"""
import copy, json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / 'episodes/ep001full/scenes.json'
LEGACY = ROOT / 'episodes/ep001full/scenes.legacy_v1.json'
MAN = ROOT / 'docs/art_intake/EP001_V3_CLEAN/art_manifest_V3_CLEAN_R1.json'
REWIRE = ROOT / 'docs/art_orders/EP001_v2_3/SecondQuest_EP001_SCENE_REWIRE_v2_3.json'

POP = [{'type': 'pop_in', 'at': 0, 'duration': 0.3}]

def bg(k):
    return {'asset': k}

def ch(k, x, h=0.66, y=0.97, flip=False, anim=None, depth=None):
    l = {'asset': k, 'x': x, 'y': y, 'height': h, 'shadow': True, 'animations': copy.deepcopy(anim if anim is not None else POP)}
    if flip: l['flip'] = True
    if depth is not None: l['depth'] = depth
    return l

def ob(k, x, w, y=0.95, anim=None, depth=None):
    l = {'asset': k, 'x': x, 'y': y, 'width': w, 'shadow': True, 'animations': copy.deepcopy(anim if anim is not None else POP)}
    if depth is not None: l['depth'] = depth
    return l

BOB = [{'type': 'bounce', 'frequency': 2.2, 'intensity': 0.25}]
BREATHE = [{'type': 'breathe', 'frequency': 0.2, 'intensity': 1.2}]

# --- full.* plate -> composition (layers replacing the plate layer) ------------------------
FULL = {
    'full.portals': [bg('ep001.bg_fantasy_doors'), ch('quest.default.looking_up_awe', 0.5, 0.5)],
    'full.crime_car': [bg('core.bg.city_traffic'), ob('genre.driving_simulation.quest.cheering_car', 0.5, 0.62, 0.96)],
    'full.bank_loan': [bg('ep001.bg_bank_office'), ch('ep001.npc.banker_pointing_contract', 0.7, 0.74), ch('quest.default.worried_seated', 0.3, 0.6)],
    'full.field_empty': [bg('genre.farming.bg_field_plowed')],
    'full.field_rows': [bg('genre.farming.bg_field_sprouting'), ch('progress.calm_encouraging', 0.72, 0.42, 0.9, anim=POP + BOB)],
    'full.inbox': [bg('core.bg.office_openplan'), ch('quest.default.desk_typing', 0.4, 0.78, anim=[{'type': 'bounce', 'frequency': 5, 'intensity': 0.2}]), ch('core.prop.paper_stack', 0.78, 0.3)],
    'full.friday': [bg('core.bg.office_openplan'), ch('core.prop.calendar_friday', 0.66, 0.46, 0.8), ch('quest.default.worried_seated', 0.3, 0.6)],
    'full.inbox203b_bg': [bg('core.bg.office_openplan')],
    'full.prepare': [bg('genre.farming.bg_field_plowed'), ob('genre.farming.machine.tractor_small', 0.5, 0.42, 0.9)],
    'full.cultivate': [bg('genre.farming.bg_field_plowed'), ob('genre.farming.quest.tractor_side', 0.52, 0.5, 0.93)],
    'full.plant': [bg('genre.farming.bg_field_sprouting'), ob('genre.farming.machine.seeder', 0.5, 0.7, 0.93)],
    'full.grow_strip': [bg('genre.farming.bg_field_green')],
    'full.harvest': [bg('genre.farming.bg_field_golden'), ob('genre.farming.machine.combine', 0.5, 0.6, 0.94)],
    'full.sell': [bg('genre.farming.bg_grain_yard'), ob('genre.farming.machine.grain_truck', 0.5, 0.62, 0.95)],
    'full.empty_full': [bg('genre.farming.bg_field_golden'), ch('quest.default.arms_up_back', 0.5, 0.62)],
    'full.field_full': [bg('genre.farming.bg_field_golden')],
    'full.loop_sunset': [bg('core.bg.sunset_sky'), {'asset': 'genre.farming.layer.sunset_farm_midground', 'x': 0.5, 'y': 0.52, 'width': 1.0, 'depth': 0.35},
                         ch('genre.farming.quest.cap_off_sunset', 0.5, 0.6, anim=BREATHE)],
    'full.plan_board': [bg('core.bg.home_living_night'), ch('quest.default.planning_tablet', 0.38, 0.66), ch('progress.presenting', 0.7, 0.42, 0.9, anim=POP + BOB)],
    'full.start_small_bg': [bg('genre.farming.bg_farm_yard')],
    'full.work_earn_bg': [bg('genre.farming.bg_field_plowed')],
    'full.improve_bg': [bg('genre.farming.bg_workshop')],
    'full.expand': [bg('genre.farming.bg_farm_aerial')],
    'full.repeat_bg': [bg('genre.farming.bg_field_sprouting')],
    'full.next_upgrade': [bg('genre.farming.bg_dealership'), ob('genre.farming.machine.tractor_bigger', 0.52, 0.5, 0.94)],
    'full.cycle_relax': [bg('genre.farming.bg_tractor_cab'), ch('quest.default.drive_relaxed', 0.5, 0.66, 1.02, anim=BREATHE)],
    'full.farm_yours': [bg('genre.farming.bg_farm_yard'), ch('genre.farming.prop.farm_sign_blank', 0.74, 0.36, 0.95)],
    'full.chores': [bg('core.bg.home_living_day'), ch('quest.default.broom_bored', 0.38, 0.7), ch('core.prop.laundry_basket', 0.72, 0.26)],
    'full.mining': [bg('genre.farming.bg_field_plowed'), ch('genre.building_sandbox.quest.pickaxe', 0.5, 0.7, anim=POP + [{'type': 'bounce', 'frequency': 2.5, 'intensity': 0.3}])],
    'full.cleaning': [bg('core.bg.home_living_day'), ch('quest.default.vacuum', 0.45, 0.7)],
    'full.truck': [bg('ep001.bg_crossroads'), ob('genre.farming.machine.grain_truck', 0.5, 0.6, 0.97)],
    'full.farm_montage': [bg('genre.farming.bg_grain_yard'), ob('genre.farming.machine.combine', 0.32, 0.42, 0.95), ob('genre.farming.machine.tractor_small', 0.74, 0.3, 0.95)],
    'full.progress_chore': [bg('core.bg.home_living_day'), ch('quest.default.vacuum', 0.4, 0.7)],
    'full.night_gamer_bg': [bg('core.bg.living_room_night_gaming')],
    'full.goals_list': [bg('core.bg.home_living_night'), ch('quest.default.planning_tablet', 0.5, 0.68)],
    'full.traffic': [bg('core.bg.city_traffic'), ch('quest.default.drive_stressed', 0.5, 0.56, 1.0)],
    'full.prices': [bg('core.bg.home_living_night'), ch('wallet.overwhelmed_debt', 0.5, 0.56)],
    'full.router': [bg('core.bg.home_living_night'), ch('core.prop.router', 0.68, 0.22, 0.86), ch('quest.default.head_in_hands', 0.34, 0.6)],
    'full.mini_farm': [bg('core.bg.home_living_night'), ch('core.prop.mini_farm', 0.5, 0.5, 0.86)],
    'full.cause_chain': [bg('genre.farming.bg_farm_aerial'), ob('core.prop.domino_row', 0.5, 0.62, 0.7)],
    'full.domino': [bg('genre.farming.bg_farm_aerial'), ob('core.prop.domino_row', 0.5, 0.7, 0.72)],
    'full.aerial_tractor': [bg('genre.farming.bg_field_overhead'), ch('genre.farming.machine.tractor_topdown', 0.5, 0.42, 0.75, anim=POP)],
    'full.green_elephant': [bg('genre.farming.bg_dealership'), ob('genre.farming.machine.tractor_huge', 0.6, 0.5, 0.95), ch('quest.default.looking_up_awe', 0.22, 0.5)],
    'full.tractors_cool': [bg('genre.farming.bg_dealership'), ob('genre.farming.machine.tractor_bigger', 0.6, 0.46, 0.95), ch('genre.farming.quest.excited', 0.24, 0.6)],
    'full.variety': [bg('genre.farming.bg_field_green'), ob('genre.farming.machine.combine', 0.27, 0.38, 0.9), ob('genre.farming.machine.tractor_small', 0.56, 0.22, 0.9), ob('genre.farming.machine.sprayer', 0.8, 0.36, 0.95)],
    'full.factory_wheels_bg': [bg('genre.farming.bg_field_golden')],
    'full.care': [bg('genre.farming.bg_field_green'), ob('genre.farming.machine.sprayer', 0.5, 0.74, 0.92)],
    'full.manual_bg': [bg('genre.farming.bg_workshop')],
    'full.catalog_bg': [bg('genre.farming.bg_dealership')],
    'full.bigger_header': [bg('genre.farming.bg_field_golden'), ob('genre.farming.machine.header_12m', 0.5, 0.95, 0.85)],
    'full.sunset_quest': [bg('core.bg.sunset_sky'), {'asset': 'genre.farming.layer.sunset_farm_midground', 'x': 0.5, 'y': 0.52, 'width': 1.0, 'depth': 0.35},
                          ch('quest.default.sitting_back', 0.3, 0.52, 0.85, anim=BREATHE, depth=0.75), {'asset': 'core.layer.fence_foreground', 'x': 0.51, 'y': 0.556, 'width': 0.95, 'depth': 1.0}],
    'full.slow_cab': [bg('genre.farming.bg_tractor_cab'), ch('quest.default.drive_calm', 0.5, 0.66, 1.02, anim=BREATHE)],
    'full.calm_field': [bg('genre.farming.bg_field_golden')],
    'full.overhead_rows': [bg('genre.farming.bg_field_overhead'), ch('genre.farming.machine.tractor_topdown', 0.5, 0.36, 0.7)],
    'full.grind_quest': [bg('core.bg.home_living_night'), ch('quest.default.phone_overwhelmed', 0.34, 0.66), ch('grind.relaxed', 0.72, 0.46, 0.9)],
    'full.notif_cloud': [bg('core.bg.home_living_night'), ch('quest.default.phone_overwhelmed', 0.5, 0.68)],
    'full.cab_relaxed': [bg('genre.farming.bg_tractor_cab'), ch('quest.default.drive_relaxed', 0.5, 0.66, 1.02, anim=BREATHE)],
    'full.real_gate': [bg('genre.farming.bg_real_farm')],
    'full.sacks': [bg('genre.farming.bg_real_farm'), ch('genre.farming.quest.carrying_sacks', 0.4, 0.68), ch('genre.farming.prop.sacks_pile', 0.76, 0.26)],
    'full.rain': [bg('genre.farming.bg_farm_storm'), ch('genre.farming.quest.rain_huddled', 0.5, 0.52)],
    'full.broken': [bg('genre.farming.bg_workshop'), ob('genre.farming.machine.broken_tractor', 0.6, 0.5, 0.95), ch('quest.default.head_in_hands', 0.24, 0.5)],
    'full.real_vs_sim': [bg('genre.farming.bg_workshop'), ob('genre.farming.machine.broken_tractor', 0.6, 0.5, 0.95), ch('quest.default.head_in_hands', 0.24, 0.5)],
    'full.water': [bg('genre.farming.bg_riverbank'), ob('genre.farming.machine.harvester_water', 0.5, 0.66, 0.9)],
}
# foreground halves of the retired bg/fg plate pairs -> FINAL_ART subjects
FULL_FG = {
    'full.inbox203b': [ch('core.prop.printer_avalanche', 0.56, 0.62)],
    'full.start_small': [ob('genre.farming.machine.tractor_small', 0.5, 0.34, 0.92)],
    'full.work_earn': [ch('genre.farming.quest.planting', 0.42, 0.68)],
    'full.improve': [ch('quest.default.wrench_fixing', 0.36, 0.6), ob('genre.farming.machine.broken_tractor', 0.68, 0.44, 0.95)],
    'full.repeat': [ob('genre.farming.machine.seeder', 0.5, 0.66, 0.93)],
    'full.night_gamer': [ch('quest.default.gaming_excited', 0.4, 0.7)],
    'full.factory_wheels': [ob('genre.farming.machine.factory_harvester', 0.5, 0.56, 0.95)],
    'full.manual': [ch('quest.default.reading_manual', 0.42, 0.7), ch('core.prop.toolbox', 0.78, 0.22)],
    'full.catalog': [ob('genre.farming.machine.header_3m', 0.3, 0.3, 0.6), ob('genre.farming.machine.header_6m', 0.62, 0.46, 0.78)],
}
# per-shot composition overrides (Creative Cast Delta + shot meaning)
SHOT = {
    'm17d_debt': {'full.bank_loan': [bg('ep001.bg_bank_office'), ch('ep001.npc.banker', 0.72, 0.74)]},
    'm28d_prices': {'full.prices': [bg('core.bg.home_living_night'), ch('wallet.overwhelmed_debt', 0.5, 0.56)]},
    'm41b_markets': {'full.prices': [bg('genre.farming.bg_farm_yard'), ch('wallet.market_crushed', 0.5, 0.56)]},
    'm42d_second': {'full.real_vs_sim': [bg('genre.farming.bg_idealized_game_farm'), ob('genre.farming.machine.tractor_small', 0.62, 0.36, 0.95), ch('genre.farming.quest.excited', 0.3, 0.62)]},
    'm43d_solve': {'full.broken': [bg('genre.farming.bg_workshop'), ob('genre.farming.machine.broken_tractor', 0.62, 0.5, 0.95), ch('quest.default.wrench_fixing', 0.26, 0.56)]},
    'm38c_terrible': {'full.notif_cloud': [bg('core.bg.home_living_night'), ch('quest.default.phone_overwhelmed', 0.5, 0.68), ch('grind.relaxed', 0.8, 0.4, 0.92)]},
    'm36a_place': {'full.sunset_quest': FULL['full.sunset_quest'][:3] + [ch('progress.quiet_companion', 0.48, 0.3, 0.86, anim=BREATHE, depth=0.75), FULL['full.sunset_quest'][3]]},
    'm43a_question': {'full.sunset_quest': FULL['full.sunset_quest'][:3] + [ch('progress.calm_encouraging', 0.48, 0.3, 0.86, anim=BREATHE, depth=0.75), FULL['full.sunset_quest'][3]]},
    'm27c_plans': {'full.goals_list': [bg('core.bg.home_living_night'), ch('quest.default.planning_tablet', 0.38, 0.68), ch('grind.straining', 0.74, 0.44, 0.92)]},
}
# legacy key in a given shot -> FINAL_ART key (shot meaning / delta), applied before the generic remap
SHOT_KEY = {
    'm34c_machines': {'ep001.bg_farm_panorama': 'genre.farming.bg_farm_aerial'},
    'm35a_buildings': {'ep001.bg_farm_panorama': 'genre.farming.bg_farm_yard'},
    'm35b_animals': {'ep001.bg_farm_panorama': 'genre.farming.bg_farm_yard'},
    'm35c_chain': {'ep001.bg_farm_panorama': 'genre.farming.bg_farm_aerial'},
    'm41d_status': {'ep001.bg_farm_panorama': 'genre.farming.bg_farm_yard'},
    'm45e_escape': {'ep001.bg_farm_panorama': 'genre.farming.bg_farm_aerial'},
    'm17d_debt': {'wallet.worried': 'wallet.overwhelmed_debt'},
    'm27d_harvester': {'wallet.worried': 'wallet.overwhelmed_debt'},
    'm33c_house': {'wallet.worried': 'wallet.price_shock'},
    'm35d_debt': {'wallet.worried': 'wallet.overwhelmed_debt'},
    'm18_sense': {'progress.cheering': 'progress.calm_encouraging'},
    'm27a_three': {'progress.cheering': 'progress.presenting'},
    'm36b_potential': {'progress.cheering': 'progress.quiet_companion'},
    'm43c_see': {'progress.cheering': 'progress.calm_encouraging'},
}

def damp_camera(cam, f):
    """Scale every zoom/pan excursion of a camera towards neutral by factor f (0..1)."""
    st = cam.get('start')
    if st:
        if 'zoom' in st: st['zoom'] = round(1 + (st['zoom'] - 1) * f, 4)
        for ax in ('x', 'y'):
            if ax in st: st[ax] = round(0.5 + (st[ax] - 0.5) * f, 4)
    for m in cam.get('moves', []):
        if 'amount' in m: m['amount'] = round(m['amount'] * f, 4)
        if 'zoom' in m: m['zoom'] = round(1 + (m['zoom'] - 1) * f, 4)
        for ax in ('x', 'y'):
            if ax in m: m[ax] = round(0.5 + (m[ax] - 0.5) * f, 4)

def main():
    if not LEGACY.exists():
        LEGACY.write_text(SRC.read_text())
    data = json.loads(LEGACY.read_text())
    man = json.loads(MAN.read_text())
    remap = {a['replaces']: a['key'] for a in man['assets'] if a.get('replaces')}
    remap.update({k: v for k, v in json.loads(REWIRE.read_text())['hook_engine_key_map'].items() if not v.startswith('LAYERED')})
    known = {a['key'] for a in man['assets']} | {a['key'] for a in json.loads((ROOT / 'docs/art_intake/EP001_V3_CLEAN/supplemental_art_manifest.json').read_text())['assets']}

    def fix(layers, sid):
        out = []
        for l in layers:
            if l.get('type') == 'group':
                l = dict(l, layers=fix(l['layers'], sid)); out.append(l); continue
            k = l.get('asset')
            if k is None:
                out.append(l); continue
            if k == 'ep001.email_icon':  # programmatic UI (Scene Rewire v2.3)
                out.append({'type': 'counter', 'label': {'en': 'Inbox', 'es': 'Bandeja'}, 'initial': 12, 'x': 0.74, 'y': 0.16, 'size': 72,
                            'steps': [{'at': l.get('at', 0), 'value': 203, 'duration': 1.0, 'easing': 'inCubic'}]})
                continue
            if k in SHOT.get(sid, {}):
                out.extend(copy.deepcopy(SHOT[sid][k])); continue
            if k in FULL:
                out.extend(copy.deepcopy(FULL[k])); continue
            if k in FULL_FG:
                out.extend(copy.deepcopy(FULL_FG[k])); continue
            if k == 'quest.tractor_heroic':  # layered rebuild (Scene Rewire v2.3)
                x, y, h = l.get('x', 0.5), l.get('y', 0.97), l.get('height', 0.6)
                out.append({**{kk: vv for kk, vv in l.items() if kk not in ('asset', 'height', 'width', 'swaps')}, 'asset': 'genre.farming.machine.tractor_huge', 'x': x + 0.08, 'y': y, 'width': round(h * 0.66, 4)})
                out.append({**{kk: vv for kk, vv in l.items() if kk not in ('asset', 'height', 'width', 'swaps')}, 'asset': 'genre.farming.quest.heroic', 'x': x - 0.17, 'y': y, 'height': h * 0.85})
                continue
            k2 = SHOT_KEY.get(sid, {}).get(k, remap.get(k, k))
            l = dict(l, asset=k2)
            if l.get('swaps'):
                l['swaps'] = [dict(s, asset=SHOT_KEY.get(sid, {}).get(s['asset'], remap.get(s['asset'], s['asset']))) for s in l['swaps']]
            out.append(l)
        return out

    for s in data['scenes']:
        s['layers'] = fix(s['layers'], s['id'])
    sc = {s['id']: s for s in data['scenes']}

    # M11: detail plate -> wide reveal (no 5.5x digital zoom)
    s11 = sc['s11_field']
    s11['layers'] = [dict(l, asset='genre.farming.bg_field_huge_detail', hide='l12+0.9') if l.get('asset') == 'genre.farming.bg_field_huge_wide' else l for l in s11['layers']]
    s11['layers'].insert(1, {'asset': 'genre.farming.bg_field_huge_wide', 'show': 'l12+0.9',
                             'animations': [{'type': 'fade_in', 'at': 'l12+0.9', 'duration': 0.35}]})
    s11['camera'] = {'start': {'zoom': 1.15, 'x': 0.5, 'y': 0.55}, 'moves': [{'type': 'pull_out', 'amount': 0.13, 'easing': 'inOutSine'}], 'drift': 0.5}
    # M13: three dedicated station backgrounds, each <= 1.15x
    s13 = sc['s13_chores']
    st = ['genre.farming.bg_station_planting', 'genre.farming.bg_station_fertilizer', 'genre.farming.bg_station_animals']
    rest = [l for l in s13['layers'] if l.get('asset') != 'genre.farming.bg_station_animals']
    s13['layers'] = [{'asset': st[0], 'hide': 'l15-0.05'}, {'asset': st[1], 'show': 'l15-0.05', 'hide': 'l16-0.05'}, {'asset': st[2], 'show': 'l16-0.05'}] + rest
    s13['camera'] = {'start': {'zoom': 1.08, 'x': 0.5, 'y': 0.55}, 'moves': [{'type': 'push_in', 'amount': 0.06, 'easing': 'inOutSine'}], 'drift': 0.4}
    # M15: identity beat 3.8 s from "So...", wordmark readable >= 2.4 s (appears on "why?")
    s15 = sc['s15_sunset']
    s15['end'] = 'l18+3.8'
    for l in s15['layers']:
        if l.get('type') == 'rect' and l.get('depth') == 'screen':
            l['show'] = 'l19-0.1'; l['animations'] = [{'type': 'fade_in', 'at': 'l19-0.1', 'duration': 0.3}]
        if l.get('type') == 'wordmark':
            l['at'] = 'l19'; l['animations'] = [{'type': 'punch_in', 'at': 'l19', 'duration': 0.28, 'intensity': 0.35}]
    s15['note'] = "Quiet sunset. 'So... why?' SecondQuest identity beat 3.8 s (from \"So...\"), wordmark readable >= 2.4 s."
    sc['m16a_fantasies']['start'] = 'l18+3.8'

    # state swaps between assets that are not a registered swap_set -> clean cut between two layers
    sets = {a['key']: a.get('swap_set') for a in man['assets']}
    def unswap(layers):
        out = []
        for l in layers:
            if l.get('type') == 'group':
                out.append(dict(l, layers=unswap(l['layers']))); continue
            sw = l.get('swaps') or []
            if sw and any(not sets.get(l['asset']) or sets.get(l['asset']) != sets.get(x['asset']) for x in sw):
                chain = [(l['asset'], None)] + [(x['asset'], x['at']) for x in sw]
                for i, (k, at) in enumerate(chain):
                    nl = {kk: vv for kk, vv in l.items() if kk != 'swaps'}
                    nl['asset'] = k
                    if at is not None:
                        nl['show'] = at
                        nl['animations'] = [a for a in l.get('animations', []) if a.get('type') not in ('pop_in', 'drop_in', 'slide_in', 'fade_in')] + [{'type': 'pop_in', 'at': at, 'duration': 0.22}]
                        if 'id' in nl: nl['id'] = f"{nl['id']}_{i}"
                    if i + 1 < len(chain):
                        nl['hide'] = chain[i + 1][1]
                    out.append(nl)
            else:
                out.append(l)
        return out
    for s in data['scenes']:
        s['layers'] = unswap(s['layers'])
    # draw at native size or smaller (BAD_RESOLUTION)
    def each(fn):
        def go(ls):
            for l in ls:
                if l.get('type') == 'group': go(l['layers'])
                else: fn(l)
        for s in data['scenes']: go(s['layers'])
    def shrink_dragon(l):
        if l.get('asset') == 'genre.fantasy.dragon':
            for kk in ('height', 'width'):
                if kk in l: l[kk] = round(l[kk] * 0.84, 4)
    each(shrink_dragon)
    # never draw art larger than its native pixels (allowing 15 % camera zoom): cap layer size
    cat = json.loads((ROOT / 'shared/art_catalog.json').read_text())['assets']
    def cap(l):
        e = cat.get(l.get('asset', ''))
        if not e or e['kind'] == 'background' or l.get('type') in ('wordmark', 'swarm'): return
        nh = int(e['resolution'].split('x')[1])
        if 'height' in l: l['height'] = round(min(l['height'], nh / (1080 * 1.22)), 4)
        if 'width' in l: l['width'] = round(min(l['width'], nh * e['aspect'] / (1920 * 1.22)), 4)
    each(cap)
    # camera damping per scene so every asset stays within safe_zoom (factors tuned by scripts/ep001-safe-zoom.py)
    fac_path = ROOT / 'episodes/ep001full/camera_safe_zoom_factors.json'
    factors = json.loads(fac_path.read_text()) if fac_path.exists() else {}
    for sid, f in factors.items():
        damp_camera(sc[sid].get('camera', {}), f)
        for l in sc[sid]['layers']:
            if l.get('type') == 'group' and l.get('camera'): damp_camera(l['camera'], f)

    # Quest seated pose (genre.farming.quest.tractor_side) always rides the small tractor:
    # quest canvas point (0.45, 0.62) on the tractor seat (0.66, 0.42); tractor drawn over the legs
    AT = 2336 / 1744
    def ride(layers):
        out = []
        for l in layers:
            if l.get('type') == 'group':
                out.append(dict(l, layers=ride(l['layers']))); continue
            if l.get('asset') != 'genre.farming.quest.tractor_side':
                out.append(l); continue
            ht = (l.get('height') or 0.5) * 1.05
            wt = ht / (16 / 9 / AT)
            X, Y = l.get('x', 0.5), l.get('y', 0.97)
            flip = bool(l.get('flip'))
            sx = -1 if flip else 1
            common = {k: v for k, v in l.items() if k not in ('asset', 'x', 'y', 'height', 'width', 'anchor', 'id', 'shadow')}
            q = dict(common, asset='genre.farming.quest.tractor_side', x=round(X + sx * 0.16 * wt, 4), y=round(Y - 0.58 * ht, 4),
                     height=round(0.992 * ht, 4), anchor=[0.55 if flip else 0.45, 0.62])
            t = dict(common, asset='genre.farming.machine.tractor_small', x=X, y=Y, width=round(wt, 4), anchor=[0.5, 1.0], shadow=True)
            if 'id' in l: t['id'] = l['id']
            out += [q, t]
        return out
    for s in data['scenes']:
        s['layers'] = ride(s['layers'])
    # registered sunset set: landscape fills the bottom, Quest sits on the top rail of the fence
    MG = {'asset': 'genre.farming.layer.sunset_farm_midground', 'x': 0.5, 'y': 1.06, 'width': 1.12, 'anchor': [0.5, 0.77], 'depth': 0.35}
    FE = {'asset': 'core.layer.fence_foreground', 'x': 0.56, 'y': 1.06, 'width': 0.72, 'anchor': [0.5, 0.83], 'depth': 0.8}
    SEAT = {'x': 0.416, 'y': 0.7216, 'height': 0.40, 'anchor': [0.5, 0.93], 'depth': 0.8}
    def sunset(layers):
        out = []
        for l in layers:
            k = l.get('asset')
            if k == 'genre.farming.layer.sunset_farm_midground':
                out.append(dict({kk: vv for kk, vv in l.items() if kk not in ('x', 'y', 'width', 'height', 'anchor', 'depth')}, **MG))
            elif k == 'core.layer.fence_foreground':
                out.append(dict({kk: vv for kk, vv in l.items() if kk not in ('x', 'y', 'width', 'height', 'anchor', 'depth')}, **FE))
            elif k in ('quest.default.sitting_back', 'quest.default.sitting_back_turn'):
                out.append(dict({kk: vv for kk, vv in l.items() if kk not in ('x', 'y', 'width', 'height', 'anchor', 'depth', 'shadow')}, **SEAT))
            elif k == 'genre.farming.quest.cap_off_sunset':
                out.append(dict(l, y=0.99, height=0.6))
            else:
                out.append(l)
        return out
    for s in data['scenes']:
        if any(l.get('asset') == 'genre.farming.layer.sunset_farm_midground' for l in s['layers']):
            s['layers'] = sunset(s['layers'])
            fence_i = next((i for i, l in enumerate(s['layers']) if l.get('asset') == 'core.layer.fence_foreground'), None)
            seat_i = next((i for i, l in enumerate(s['layers']) if l.get('asset', '').startswith('quest.default.sitting_back')), None)
            if fence_i is not None and seat_i is not None and seat_i < fence_i:  # Quest sits ON the fence: draw after it
                q = s['layers'].pop(seat_i); s['layers'].insert(fence_i, q)

    for s in data['scenes']:  # every image must now be FINAL_ART
        def chk(ls):
            for l in ls:
                if l.get('type') == 'group': chk(l['layers'])
                for k in [l.get('asset')] + [x['asset'] for x in l.get('swaps', [])]:
                    if k and k not in known: raise SystemExit(f'UNMAPPED {s["id"]}: {k}')
        chk(s['layers'])
    SRC.write_text(json.dumps(data, indent=2, ensure_ascii=False) + '\n')
    print('rewired', len(data['scenes']), 'scenes')

if __name__ == '__main__':
    main()
