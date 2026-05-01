import { $, component$, useOnDocument, useSignal } from "@builder.io/qwik";

import styles from "./use-wordle.module.css";

// ---------------------------------------------------------------------------
// Constants (from SamuelQuinones/svelte-wordle settings.ts)
// ---------------------------------------------------------------------------
const MAX_WORD_LENGTH = 5;
const MAX_CHALLENGES = 6;

// ---------------------------------------------------------------------------
// Word pool (from SamuelQuinones/svelte-wordle wordlist.ts)
// ---------------------------------------------------------------------------
const WORDS = [
  "which","there","their","about","would","these","other","words","could","write",
  "first","water","after","where","right","think","three","years","place","sound",
  "great","again","still","every","small","found","those","never","under","might",
  "while","house","world","below","asked","going","large","until","along","shall",
  "being","often","earth","began","since","study","night","light","above","paper",
  "parts","young","story","point","times","heard","whole","white","given","means",
  "music","miles","thing","today","later","using","money","lines","order","group",
  "among","learn","known","space","table","early","trees","short","hands","state",
  "black","shown","stood","front","voice","kinds","makes","comes","close","power",
  "lived","vowel","taken","built","heart","ready","quite","class","bring","round",
  "horse","shows","piece","green","stand","birds","start","river","tried","least",
  "field","whose","girls","leave","added","color","third","hours","moved","plant",
  "doing","names","forms","heavy","ideas","cried","check","floor","begin","woman",
  "alone","plane","spell","watch","carry","wrote","clear","named","books","child",
  "glass","human","takes","party","build","seems","blood","sides","seven","mouth",
  "solve","north","value","death","maybe","happy","tells","gives","looks","shape",
  "lives","steps","areas","sense","speak","force","ocean","speed","women","metal",
  "south","grass","scale","cells","lower","sleep","wrong","pages","ships","needs",
  "rocks","eight","major","level","total","ahead","reach","stars","store","sight",
  "terms","catch","works","board","cover","songs","equal","stone","waves","guess",
  "dance","spoke","break","cause","radio","weeks","lands","basic","liked","trade",
  "fresh","final","fight","meant","drive","spent","local","waxes","knows","train",
  "bread","homes","teeth","coast","thick","brown","clean","quiet","sugar","facts",
  "steel","forth","rules","notes","units","peace","month","verbs","seeds","helps",
  "sharp","visit","woods","chief","walls","cross","wings","grown","cases","foods",
  "crops","fruit","stick","wants","stage","sheep","nouns","plain","drink","bones",
  "apart","turns","moves","touch","angle","based","range","marks","tired","older",
  "farms","spend","shoes","goods","chair","twice","cents","empty","alike","style",
  "broke","pairs","count","enjoy","score","shore","roots","paint","heads","shook",
  "serve","angry","crowd","wheel","quick","dress","share","alive","noise","solid",
  "cloth","signs","hills","types","drawn","worth","truck","piano","upper","loved",
  "usual","faces","drove","cabin","boats","towns","proud","court","model","prime",
  "fifty","plans","yards","prove","tools","price","sheet","smell","boxes","raise",
  "match","truth","roads","threw","enemy","lunch","chart","scene","graph","doubt",
  "guide","winds","block","grain","smoke","mixed","games","wagon","sweet","topic",
  "extra","plate","title","knife","fence","falls","cloud","wheat","plays","enter",
  "broad","steam","atoms","press","lying","basis","clock","taste","grows","thank",
  "storm","agree","brain","track","smile","funny","beach","stock","hurry","saved",
  "sorry","giant","trail","offer","ought","rough","daily","avoid","keeps","throw",
  "allow","cream","laugh","edges","teach","frame","bells","dream","magic","occur",
  "ended","chord","false","skill","holes","dozen","brave","apple","climb","outer",
  "pitch","ruler","holds","fixed","costs","calls","blank","staff","labor","eaten",
  "youth","tones","honor","globe","gases","doors","poles","loose","apply","tears",
  "exact","brush","chest","layer","whale","minor","faith","tests","judge","items",
  "worry","waste","hoped","strip","begun","aside","lakes","bound","depth","candy",
  "event","worse","aware","shell","rooms","ranch","image","snake","aloud","dried",
  "likes","motor","pound","knees","refer","fully","chain","shirt","flour","drops",
  "spite","orbit","banks","shoot","curve","tribe","tight","blind","slept","shade",
  "claim","flies","theme","queen","fifth","union","hence","straw","entry","issue",
  "birth","feels","anger","brief","rhyme","glory","guard","flows","flesh","owned",
  "trick","yours","sizes","noted","width","burst","route","lungs","uncle","bears",
  "royal","kings","forty","trial","cards","brass","opera","chose","owner","vapor",
  "beats","mouse","tough","wires","meter","tower","finds","inner","stuck","arrow",
  "poems","label","swing","solar","truly","tense","beans","split","rises","weigh",
  "hotel","stems","pride","swung","grade","digit","badly","boots","pilot","sales",
  "swept","lucky","prize","stove","tubes","acres","wound","steep","slide","trunk",
  "error","porch","slave","exist","faced","mines","marry","juice","raced","waved",
  "goose","trust","fewer","favor","mills","views","joint","eager","spots","blend",
  "rings","adult","index","nails","horns","balls","flame","rates","drill","trace",
  "skins","waxed","seats","stuff","ratio","minds","dirty","silly","coins","hello",
  "trips","leads","rifle","hopes","bases","shine","bench","moral","fires","meals",
  "shake","shops","cycle","movie","slope","canoe","teams","folks","fired","bands",
  "thumb","shout","canal","habit","reply","ruled","fever","crust","shelf","walks",
  "midst","crack","print","tales","coach","stiff","flood","verse","awake","rocky",
  "march","fault","swift","faint","civil","ghost","feast","blade","limit","germs",
  "reads","ducks","dairy","worst","gifts","lists","stops","rapid","brick","claws",
  "beads","beast","skirt","cakes","lions","frogs","tries","nerve","grand","armed",
  "treat","honey","moist","legal","penny","crown","shock","taxes","sixty","altar",
  "pulls","sport","drums","talks","dying","dates","drank","blows","lever","wages",
  "proof","drugs","tanks","sings","tails","pause","herds","arose","hated","clues",
  "novel","shame","burnt","races","flash","weary","heels","token","coats","spare",
  "shiny","alarm","dimes","sixth","clerk","mercy","sunny","guest","float","shone",
  "pipes","worms","bills","sweat","suits","smart","upset","rains","sandy","rainy",
  "parks","sadly","fancy","rider","unity","bunch","rolls","crash","craft","newly",
  "gates","hatch","paths","funds","wider","grace","grave","tides","admit","shift",
  "sails","pupil","tiger","angel","cruel","agent","drama","urged","patch","nests",
  "vital","sword","blame","weeds","screw","vocal","bacon","chalk","cargo","crazy",
  "acted","goats","arise","witch","loves","queer","dwell","backs","ropes","shots",
  "merry","phone","cheek","peaks","ideal","beard","eagle","creek","cries","ashes",
  "stall","yield","mayor","opens","input","fleet","tooth","cubic","wives","burns",
  "poets","apron","spear","organ","cliff","stamp","paste","rural","baked","chase",
  "slice","slant","knock","noisy","sorts","stays","wiped","blown","piled","clubs",
  "cheer","widow","twist","tenth","hides","comma","sweep","spoon","stern","crept",
  "maple","deeds","rides","muddy","crime","jelly","ridge","drift","dusty","devil",
  "tempo","humor","sends","steal","tents","waist","roses","reign","noble","cheap",
  "dense","linen","geese","woven","posts","hired","wrath","salad","bowed","tires",
  "shark","belts","grasp","blast","polar","fungi","tends","pearl","loads","jokes",
  "veins","frost","hears","loses","hosts","diver","phase","toads","alert","tasks",
  "seams","coral","focus","naked","puppy","jumps","spoil","quart","macro","fears",
  "flung","spark","vivid","brook","steer","spray","decay","ports","socks","urban",
  "goals","grant","minus","films","tunes","shaft","firms","skies","bride","wreck",
  "flock","stare","hobby","bonds","dared","faded","thief","crude","pants","flute",
  "votes","tonal","radar","wells","skull","hairs","argue","wears","dolls","voted",
  "caves","cared","broom","scent","panel","fairy","olive","bends","prism","lamps",
  "cable","peach","ruins","rally","schwa","lambs","sells","cools","draft","charm",
  "limbs","brake","gazed","cubes","delay","beams","fetch","ranks","array","harsh",
  "camel","vines","picks","naval","purse","rigid","crawl","toast","soils","sauce",
  "basin","ponds","twins","wrist","fluid","pools","brand","stalk","robot","reeds",
  "hoofs","buses","sheer","grief","bloom","dwelt","melts","risen","flags","knelt",
  "fiber","roofs","freed","armor","piles","aimed","algae","twigs","lemon","ditch",
  "drunk","rests","chill","slain","panic","cords","tuned","crisp","ledge","dived",
  "swamp","clung","stole","molds","yarns","liver","gauge","breed","stool","gulls",
  "awoke","gross","diary","rails","belly","trend","flask","stake","fried","draws",
  "actor","handy","bowls","haste","scope","deals","knots","moons","essay","thump",
  "hangs","bliss","dealt","gains","bombs","clown","palms","cones","roast","tidal",
  "bored","chant","acids","dough","camps","swore","lover","hooks","males","cocoa",
  "punch","award","reins","ninth","noses","links","drain","fills","nylon","lunar",
  "pulse","flown","elbow","fatal","sites","moths","meats","foxes","mined","attic",
  "fiery","mount","usage","swear","snowy","rusty","scare","traps","relax","react",
  "valid","robin","cease","gills","prior","safer","polio","loyal","swell","salty",
  "marsh","vague","weave","mound","seals","mules","virus","scout","acute","windy",
  "stout","folds","seize","hilly","joins","pluck","stack","lords","dunes","burro",
  "hawks","trout","feeds","scarf","halls","coals","towel","souls","elect","buggy",
  "pumps","loans","spins","files","oxide","pains","photo","rival","flats","syrup",
  "rodeo","sands","moose","pints","curly","comic","cloak","onion","clams","scrap",
  "didst","couch","codes","fails","ounce","lodge","greet","gypsy","utter","paved",
  "zones","fours","alley","tiles","bless","crest","elder","kills","yeast","erect",
  "bugle","medal","roles","hound","snail","alter","ankle","relay","loops","zeros",
  "bites","modes","debts","realm","glove","rayon","swims","poked","stray","lifts",
  "maker","lumps","graze","dread","barns","docks","masts","pours","wharf","curse",
  "plump","robes","seeks","cedar","curls","jolly","myths","cages","gloom","locks",
  "pedal","beets","crows","anode","slash","creep","rowed","chips","fists","wines",
  "cares","valve","newer","motel","ivory","necks","clamp","barge","blues","alien",
  "frown","strap","crews","shack","gonna","saves","stump","ferry","idols","cooks",
  "juicy","glare","carts","alloy","bulbs","lawns","lasts","fuels","oddly","crane",
  "filed","weird","shawl","slips","troop","bolts","suite","sleek","quilt","tramp",
  "blaze","atlas","odors","scrub","crabs","probe","logic","adobe","exile","rebel",
  "grind","sting","spine","cling","desks","grove","leaps","prose","lofty","agony",
  "snare","tusks","bulls","moods","humid","finer","dimly","plank","china","pines",
  "guilt","sacks","brace","quote","lathe","gaily","fonts","scalp","adopt","foggy",
  "ferns","grams","clump","perch","tumor","teens","crank","fable","hedge","genes",
  "sober","boast","tract","cigar","unite","owing","thigh","haiku","swish","dikes",
  "wedge","booth","eased","frail","cough","tombs","darts","forts","choir","pouch",
  "pinch","hairy","buyer","torch","vigor","waltz","heats","herbs","users","flint",
  "click","madam","bleak","blunt","aided","lacks","masks","waded","risks","nurse",
  "chaos","sewed","cured","ample","lease","steak","sinks","merit","bluff","bathe",
  "gleam","bonus","colts","shear","gland","silky","skate","birch","anvil","sleds",
  "groan","maids","meets","speck","hymns","hints","drown","bosom","slick","quest",
  "coils","spied","snows","stead","snack","plows","blond","tamed","thorn","waits",
  "glued","banjo","tease","arena","bulky","carve","stunt","warms","shady","razor",
  "folly","leafy","notch","fools","otter","pears","flush","genus","ached","fives",
  "flaps","spout","smote","fumes","adapt","cuffs","tasty","stoop","clips","disks",
  "sniff","lanes","brisk","imply","demon","super","furry","raged","growl","texts",
  "hardy","stung","typed","hates","wiser","timid","serum","beaks","rotor","casts",
  "baths","glide","plots","trait","resin","slums","lyric","puffs","decks","brood",
  "mourn","aloft","abuse","whirl","edged","ovary","quack","heaps","slang","await",
  "civic","saint","bevel","sonar","aunts","packs","froze","tonic","corps","swarm",
  "frank","repay","gaunt","wired","niece","cello","needy","chuck","stony","media",
  "surge","hurts","repel","husky","dated","hunts","mists","exert","dries","mates",
  "sworn","baker","spice","oasis","boils","spurs","doves","sneak","paces","colon",
  "siege","strum","drier","cacao","humus","bales","piped","nasty","rinse","boxer",
  "shrub","amuse","tacks","cited","slung","delta","laden","larva","rents","yells",
  "spool","spill","crush","jewel","snaps","stain","kicks","tying","slits","rated",
  "eerie","smash","plums","zebra","earns","bushy","scary","squad","tutor","silks",
  "slabs","bumps","evils","fangs","snout","peril","pivot","yacht","lobby","jeans",
  "grins","viola","liner","comet","scars","chops","raids","eater","slate","skips",
  "soles","misty","urine","knobs","sleet","holly","pests","forks","grill","trays",
  "pails","borne","tenor","wares","carol","woody","canon","wakes","kitty","miner",
  "polls","shaky","nasal","scorn","chess","taxis","crate","shyly","tulip","forge",
  "nymph","budge","lowly","abide","depot","oases","asses","sheds","fudge","pills",
  "rivet","thine","groom","lanky","boost","broth","heave","gravy","beech","timed",
  "quail","inert","gears","chick","hinge","trash","clash","sighs","renew","bough",
  "dwarf","slows","quill","shave","spore","sixes","chunk","madly","paced","braid",
  "fuzzy","motto","spies","slack","mucus","magma","awful","discs","erase","posed",
  "asset","cider","taper","theft","churn","satin","slots","taxed","bully","sloth",
  "shale","tread","raked","curds","manor","aisle","bulge","loins","stair","tapes",
  "leans","bunks","squat","towed","lance","panes","sakes","heirs","caste","dummy",
  "pores","fauna","crook","poise","epoch","risky","warns","fling","berry","grape",
  "flank","drags","squid","pelts","icing","irony","irons","barks","whoop","choke",
  "diets","whips","tally","dozed","twine","kites","bikes","ticks","riots","roars",
  "vault","looms","scold","blink","dandy","pupae","sieve","spike","ducts","lends",
  "pizza","brink","widen","plumb","pagan","feats","bison","soggy","scoop","argon",
  "nudge","skiff","amber","sexes","rouse","salts","hitch","exalt","leash","dined",
  "chute","snort","gusts","melon","cheat","reefs","llama","lasso","debut","quota",
  "oaths","prone","mixes","rafts","dives","stale","inlet","flick","pinto","brows",
  "untie","batch","greed","chore","stirs","blush","onset","barbs","volts","beige",
  "swoop","paddy","laced","shove","jerky","poppy","leaks","fares","dodge","godly",
  "squaw","affix","brute","nicer","undue","snarl","merge","doses","showy","daddy",
  "roost","vases","swirl","petty","colds","curry","cobra","genie","flare","messy",
  "cores","soaks","ripen","whine","amino","plaid","spiny","mowed","baton","peers",
  "vowed","pious","swans","exits","afoot","plugs","idiom","chili","rites","serfs",
  "cleft","berth","grubs","annex","dizzy","hasty","latch","wasps","mirth","baron",
  "plead","aloof","aging","pixel","bared","mummy","hotly","auger","buddy","chaps",
  "badge","stark","fairs","gully","mumps","emery","filly","ovens","drone","gauze",
  "idiot","fussy","annoy","shank","gouge","bleed","elves","roped","unfit","baggy",
  "mower","scant","grabs","fleas","lousy","album","sawed","cooky","murky","infer",
  "burly","waged","dingy","brine","kneel","creak","vanes","smoky","spurt","combs",
  "easel","laces","humps","rumor","aroma","horde","swiss","leapt","opium","slime",
  "afire","pansy","mares","soaps","husks","snips","hazel","lined","cafes","naive",
  "wraps","sized","piers","beset","agile","tongs","steed","fraud","booty","valor",
  "downy","witty","mossy","psalm","scuba","tours","polka","milky","gaudy","shrug",
  "tufts","wilds","laser","truss","hares","creed","lilac","siren","tarry","bribe",
  "swine","muted","flips","cures","sinew","boxed","hoops","gasps","hoods","niche",
  "yucca","glows","sewer","whack","fuses","gowns","droop","bucks","pangs","mails",
  "whisk","haven","clasp","sling","stint","urges","champ","piety","chirp","pleat",
  "posse","sunup","menus","howls","quake","knack","plaza","fiend","caked","bangs",
  "erupt","poker","olden","cramp","voter","poses","manly","slump","fined","grips",
  "gaped","purge","hiked","maize","fluff","strut","sloop","prowl","roach","cocks",
  "bland","dials","plume","slaps","soups","dully","wills","foams","solos","skier",
  "eaves","totem","fused","latex","veils","mused","mains","myrrh",
];

const WORD_SET: ReadonlySet<string> = Object.freeze(new Set(WORDS));

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export type LetterStatus = "correct" | "present" | "absent";
export type GameStatus = "playing" | "won" | "lost";

export interface LetterResult {
  letter: string;
  status: LetterStatus;
}

export interface UseWordleOptions {
  /** Override the target word (useful for testing). Must be a lowercase 5-letter word. */
  initialWord?: string;
}

// ---------------------------------------------------------------------------
// Pure helpers
// ---------------------------------------------------------------------------
function getRandomWord(): string {
  return WORDS[Math.floor(Math.random() * WORDS.length)];
}

function isValidGuess(guess: string): boolean {
  return WORD_SET.has(guess);
}

/**
 * Evaluates a guess against the answer using the standard Wordle algorithm:
 *  1. First pass marks exact matches (correct).
 *  2. Second pass marks letters present but in the wrong position, taking
 *     into account how many times each letter has already been accounted for.
 */
function evaluateGuess(guess: string, answer: string): LetterResult[] {
  const result: LetterResult[] = Array.from({ length: MAX_WORD_LENGTH }, (_, i) => ({
    letter: guess[i],
    status: "absent" as LetterStatus,
  }));

  const answerLetterCounts: Record<string, number> = {};
  for (let i = 0; i < MAX_WORD_LENGTH; i++) {
    answerLetterCounts[answer[i]] = (answerLetterCounts[answer[i]] ?? 0) + 1;
  }

  // First pass: mark correct letters and decrement their counts
  for (let i = 0; i < MAX_WORD_LENGTH; i++) {
    if (guess[i] === answer[i]) {
      result[i].status = "correct";
      answerLetterCounts[guess[i]]--;
    }
  }

  // Second pass: mark present letters
  for (let i = 0; i < MAX_WORD_LENGTH; i++) {
    if (result[i].status === "correct") continue;
    const letter = guess[i];
    if ((answerLetterCounts[letter] ?? 0) > 0) {
      result[i].status = "present";
      answerLetterCounts[letter]--;
    }
  }

  return result;
}

// ---------------------------------------------------------------------------
// Keyboard layout
// ---------------------------------------------------------------------------
const KEYBOARD_ROWS = [
  ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
  ["Enter", "Z", "X", "C", "V", "B", "N", "M", "⌫"],
];

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------
export const useWordle = (options?: UseWordleOptions) => {
  const answer = useSignal(options?.initialWord ?? getRandomWord());
  const board = useSignal<LetterResult[][]>([]);
  const currentGuess = useSignal("");
  const gameStatus = useSignal<GameStatus>("playing");
  const letterStatuses = useSignal<Record<string, LetterStatus>>({});
  const errorMessage = useSignal("");

  const addLetter = $((letter: string) => {
    if (gameStatus.value !== "playing") return;
    if (currentGuess.value.length >= MAX_WORD_LENGTH) return;
    currentGuess.value += letter.toLowerCase();
    errorMessage.value = "";
  });

  const removeLetter = $(() => {
    if (currentGuess.value.length === 0) return;
    currentGuess.value = currentGuess.value.slice(0, -1);
    errorMessage.value = "";
  });

  const submit = $(() => {
    if (gameStatus.value !== "playing") return;

    const guess = currentGuess.value;

    if (guess.length !== MAX_WORD_LENGTH) {
      errorMessage.value = "Not enough letters";
      return;
    }

    if (!isValidGuess(guess)) {
      errorMessage.value = "Not in word list";
      return;
    }

    const result = evaluateGuess(guess, answer.value);
    board.value = [...board.value, result];

    const updatedStatuses = { ...letterStatuses.value };
    for (const { letter, status } of result) {
      const current = updatedStatuses[letter];
      if (current !== "correct") {
        if (status === "correct" || current !== "present") {
          updatedStatuses[letter] = status;
        }
      }
    }
    letterStatuses.value = updatedStatuses;

    if (guess === answer.value) {
      gameStatus.value = "won";
    } else if (board.value.length >= MAX_CHALLENGES) {
      gameStatus.value = "lost";
    }

    currentGuess.value = "";
    errorMessage.value = "";
  });

  const reset = $(() => {
    answer.value = getRandomWord();
    board.value = [];
    currentGuess.value = "";
    gameStatus.value = "playing";
    letterStatuses.value = {};
    errorMessage.value = "";
  });

  const Wordle = component$(() => {
    useOnDocument(
      "keydown",
      $((e: Event) => {
        const { key, ctrlKey, altKey, metaKey } = e as KeyboardEvent;
        if (ctrlKey || altKey || metaKey) return;
        if (key === "Enter") {
          submit();
        } else if (key === "Backspace") {
          removeLetter();
        } else if (/^[a-zA-Z]$/.test(key)) {
          addLetter(key);
        }
      }),
    );

    const rows = Array.from({ length: MAX_CHALLENGES }, (_, rowIndex) => {
      const submitted = board.value[rowIndex];
      const isCurrentRow = rowIndex === board.value.length && gameStatus.value === "playing";

      const cells = Array.from({ length: MAX_WORD_LENGTH }, (_, colIndex) => {
        let letter = "";
        let cellStatus: LetterStatus | "empty" | "tbd" = "empty";

        if (submitted) {
          letter = submitted[colIndex].letter.toUpperCase();
          cellStatus = submitted[colIndex].status;
        } else if (isCurrentRow) {
          letter = (currentGuess.value[colIndex] ?? "").toUpperCase();
          cellStatus = letter ? "tbd" : "empty";
        }

        return (
          <div
            key={colIndex}
            class={[
              styles["cell"],
              cellStatus === "correct" && styles["cell--correct"],
              cellStatus === "present" && styles["cell--present"],
              cellStatus === "absent" && styles["cell--absent"],
              cellStatus === "tbd" && styles["cell--tbd"],
              cellStatus === "empty" && styles["cell--empty"],
            ]}
          >
            {letter}
          </div>
        );
      });

      return (
        <div key={rowIndex} class={styles["row"]}>
          {cells}
        </div>
      );
    });

    return (
      <div class={styles["wordle"]}>
        {errorMessage.value && (
          <div class={styles["error-message"]}>{errorMessage.value}</div>
        )}

        {gameStatus.value === "won" && (
          <div class={styles["status-message"]}>{`🎉 You won in ${board.value.length} ${board.value.length === 1 ? "guess" : "guesses"}!`}</div>
        )}

        {gameStatus.value === "lost" && (
          <div class={styles["status-message"]}>{`😢 The word was "${answer.value.toUpperCase()}"`}</div>
        )}

        <div class={styles["board"]}>{rows}</div>

        <div class={styles["keyboard"]}>
          {KEYBOARD_ROWS.map((row, rowIndex) => (
            <div key={rowIndex} class={styles["keyboard-row"]}>
              {row.map((key) => {
                const lowerKey = key.toLowerCase();
                const keyStatus = letterStatuses.value[lowerKey];
                return (
                  <button
                    key={key}
                    class={[
                      styles["key"],
                      key === "Enter" && styles["key--wide"],
                      key === "⌫" && styles["key--wide"],
                      keyStatus === "correct" && styles["key--correct"],
                      keyStatus === "present" && styles["key--present"],
                      keyStatus === "absent" && styles["key--absent"],
                    ]}
                    onClick$={() => {
                      if (key === "Enter") {
                        submit();
                      } else if (key === "⌫") {
                        removeLetter();
                      } else {
                        addLetter(key);
                      }
                    }}
                  >
                    {key}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {gameStatus.value !== "playing" && (
          <div class={styles["reset-container"]}>
            <button class={styles["reset-button"]} onClick$={reset}>
              Play Again
            </button>
          </div>
        )}
      </div>
    );
  });

  return {
    answer,
    board,
    currentGuess,
    gameStatus,
    letterStatuses,
    errorMessage,
    submit,
    addLetter,
    removeLetter,
    reset,
    Wordle,
  };
};
