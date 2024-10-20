<script setup>
import { toRaw, ref, reactive, computed, watch, onMounted, nextTick } from 'vue'
import SoundBite from './components/SoundBite.vue'
import { days, ANSWER_INDEX } from './data.js'

function ucfirst(str) {
	return str.charAt(0).toUpperCase() + str.slice(1)
}
function digitToWord(digit) {
	switch (digit) {
		case 0:
			return 'zero'
		case 1:
			return 'one'
		case 2:
			return 'two'
		case 3:
			return 'three'
		case 4:
			return 'four'
		case 5:
			return 'five'
		case 6:
			return 'six'
		case 7:
			return 'seven'
		case 8:
			return 'eight'
		case 9:
			return 'nine'
		default:
			throw new Error('digitToWord: digit must be between 0 and 9')
	}
}

let url = new URL(location.href)
let activeDay = ref(Number.parseInt(url.searchParams.get('q')) || 1)

let today = computed(() => days[activeDay.value - 1])

let clues = computed(() => today.value.slice(0, -1))

let ipa = computed(() => today.value.at(-1)[0])
let solutions = computed(() =>
	today.value
		.at(-1)
		.slice(1)
		.map((s) => s.toLowerCase()),
)

let correctBites = computed(() =>
	clues.value
		.map(([, answer, bites]) => answer.substring(bites[0], bites[1]))
		.join(''),
)

let bites = computed(() =>
	clues.value.map(([, , bites]) => bites).reduce((x, [a, b]) => x + b - a, 0),
) // sum of bite lengths
let answers = computed(() => clues.value.map(([, clue]) => clue))
let longest = computed(() =>
	Math.max(
		bites.value,
		...clues.value.map(([, answer]) => answer.length), // length of answers
	),
)

let guesses = reactive(
	days.map((day) => {
		let clues = day.slice(0, -1)
		return clues.map(([, answer]) => new Array(answer.length).fill(' '))
	}),
)

let todaysGuesses = computed(() => guesses[activeDay.value - 1])

let guessedBites = computed(() => {
	return clues.value
		.map(([, , bites], index) => {
			if (
				todaysGuesses.value[index].join('').toLowerCase() ===
				answers.value[index].toLowerCase()
			)
				return todaysGuesses.value[index].slice(bites[0], bites[1]).join('')
			else return new Array(bites[1] - bites[0]).fill(' ').join('')
		})
		.join('')
})

let selectedGuess = computed(() => todaysGuesses.value[selectedWordIndex.value])

let clueEls = ref([])

let selectedWordIndex = ref(null)
let selectedLetterIndex = ref(null)

function clampWordIndex(index) {
	if (index < 0) return clues.value.length - 1
	if (index >= clues.value.length) return 0
	return index
}
// loop back to start or end of word if we go out of bounds
watch(selectedWordIndex, (index, prevIndex) => {
	// exit early if all clues are solved
	console.debug('guessed bites', guessedBites.value, '==', correctBites.value)
	if (guessedBites.value === correctBites.value) return

	index = clampWordIndex(index)
	// if (index < 0) index = clues.value.length - 1
	// if (index >= clues.value.length) index = 0

	console.debug(
		'**next word',
		prevIndex,
		'->',
		index,
		answers.value[index],
		'==',
		todaysGuesses.value[index].join(''),
	)

	// skip over solved bites
	let step = index > prevIndex ? 1 : -1
	while (answers.value[index] === todaysGuesses.value[index].join('')) {
		index = clampWordIndex(index + step)
		console.debug('**trying new index', index, 'with step', step)
	}
	// bugh todo: still doesn't loop forwards correctly using the down arrow when any of the words are solved
	selectedWordIndex.value = index

	// selected the first blank space in the word
	selectedLetterIndex.value =
		selectedGuess.value.findIndex((letter) => letter === ' ') || 0
})

let finalAnswerEl = ref()
watch(guessedBites, (oldv, newv) => {
	if (oldv === correctBites.value) {
		console.debug('final gloss is correct')
		// selectedWordIndex.value = null
		// selectedLetterIndex.value = null
		finalAnswerEl.value.focus()
	}
})

let selectedWord = computed(
	() => clues.value[selectedWordIndex.value]?.[ANSWER_INDEX],
)

// loop back to start or end of word if we go out of bounds
watch(selectedLetterIndex, (index, oldIndex) => {
	if (index < 0) selectedLetterIndex.value = selectedWord.value?.length - 1
	if (index >= selectedWord.value?.length) selectedLetterIndex.value = 0
})

function handleDelete() {
	if (selectedGuess.value[selectedLetterIndex.value] === ' ') {
		// if they're on a blank space, they probably wanted to delete the previous letter
		if (selectedLetterIndex.value > 0) {
			selectedGuess.value.splice(selectedLetterIndex.value - 1, 1, ' ')
			selectedLetterIndex.value -= 1
		} else {
			// do nothing - this used to jump to the previous word and delete there but it confused people - you can still use up arrow, shift-tab, or just click to go back
			// selectedWordIndex.value -= 1
			// selectedLetterIndex.value = -1
			// selectedGuess.value.splice(selectedLetterIndex.value, 1, ' ')
		}
	} else {
		// else delete the current letter and stay where we are - it's useful that you can modify the (reactive) result of a computed value like this
		selectedGuess.value.splice(selectedLetterIndex.value, 1, ' ')
	}
}

async function handleInput(e) {
	console.debug('**handle input', e)
	if (
		!selectedGuess.value || // we'll try to auto select the appropriate guess but in case it's missing..
		//e.key === 'Meta' || // we saw "META" get entered one time in a single square, wtf is that
		//e.keyCode < 65 || // ignore non-letter keys
		!e.data || // ignore non-input here, e.g. backspace
		!/\p{L}/u.test(e.data) // crazy unicode letter regex https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Regular_expressions/Unicode_character_class_escape#loneproperty
	)
		return

	selectedGuess.value.splice(
		selectedLetterIndex.value,
		e.data.length,
		...e.data,
	)

	// jump to the next letter in the word, if there is one
	if (selectedLetterIndex.value !== selectedGuess.value.length - 1)
		selectedLetterIndex.value += e.data.length
	// jump to the next word if the current word is now sovled
	if (selectedWord.value === selectedGuess.value.join(''))
		selectedWordIndex.value += 1

	console.debug('**document active element after input', document.activeElement)
	await nextTick()
	console.debug('**..doc active el after next tick', document.activeElement)
}

watch(selectedWordIndex, (swi) => {
	console.debug('**re-focusing container after selected word change', swi)
	// clueEls[swi].value.focus()
	document
		.querySelector(`.sound-bite:nth-child(${swi + 1}) .hidden-input`)
		?.focus() // todo fix this component encapsulation leak eventually
})

// this is a mess but it works
let finalGuesses = days.map(() => '')
let finalGuess = ref('')
watch(activeDay, function (newValue, oldValue) {
	finalGuesses[oldValue - 1] = finalGuess.value // store the old value
	finalGuess.value = finalGuesses[newValue - 1] // restore/reset the new one
})
let finalSolved = computed(() =>
	solutions.value.includes(finalGuess.value.toLowerCase()),
)
console.debug('final guess initially is', finalGuesses[activeDay.value - 1])
function checkAnswer() {
	if (finalSolved.value) {
		console.debug(ipa.value)
		setTimeout(() => alert('You win!'), 20)
	}
}

let difficulty = ref(0)

let bitesEl = ref()
function goToDay(day) {
	activeDay.value = day
	// todoo: could be a nice little improvement to go to the first blank letter  instead
	selectedLetterIndex.value = 0
	selectedWordIndex.value = 0
	difficulty.value = 0 // reset to "hard" clues
	bitesEl.value.focus()
}

window.addEventListener('popstate', (e) => {
	goToDay(e.state.day)
})

function go(day) {
	goToDay(day)
	history.pushState({ day }, '', `?q=${day}`)
}

setInterval(() => {
	// console.debug('**document active element', document.activeElement)
}, 1000)
</script>

<template>
	<header>
		<h1>Sound Bites</h1>

		<span class="days">
			<a
				v-for="(data, i) in days"
				:key="i"
				tabindex="0"
				:href="`?q=${i + 1}`"
				:class="{ day: true, active: activeDay === i + 1 }"
				@click.prevent="go(i + 1)"
			>
				Day {{ ucfirst(digitToWord(i + 1)) }}
			</a>
		</span>
		<div class="difficulty">
			<label>
				<input type="radio" name="difficulty" v-model="difficulty" :value="0" />
				hard
			</label>
			<label>
				<input type="radio" name="difficulty" v-model="difficulty" :value="1" />
				easy
			</label>
		</div>
	</header>

	<main>
		<div
			class="bites"
			@keyup.up="selectedWordIndex -= 1"
			@keyup.down="selectedWordIndex += 1"
			@keyup.enter="selectedWordIndex += 1"
			@keyup.left="selectedLetterIndex -= 1"
			@keyup.right="selectedLetterIndex += 1"
			@keyup.delete="handleDelete"
			@input="handleInput"
			:inert="guessedBites === correctBites"
			tabindex="0"
			ref="bitesEl"
		>
			<SoundBite
				v-for="([clue, answer, bites], index) in clues"
				ref="clueEls"
				:key="index"
				:clue="clue[difficulty]"
				:answer="answer"
				:bites="bites"
				:guess="todaysGuesses[index]"
				:selected="selectedWordIndex === index"
				:selected-letter-index="selectedLetterIndex"
				@select-word="selectedWordIndex = index"
				@select-letter="(index) => (selectedLetterIndex = index)"
				:autofocus="index === 0"
				:padding="longest"
			/>
		</div>

		<div class="final" :inert="finalSolved">
			<div class="clue">
				<span
					class="bite"
					v-for="(letter, index) in guessedBites"
					:key="index"
					>{{ letter }}</span
				>
				<span
					v-for="i in longest - bites"
					:key="i"
					class="bite blank"
					aria-role="presentation"
				>
				</span>
			</div>
			<input
				v-model="finalGuess"
				@input="checkAnswer"
				class="answer"
				ref="finalAnswerEl"
			/>
			<span v-if="finalSolved" class="prize">🎉</span>
		</div>
	</main>

	<details class="instructions">
		<!-- todo: this should probably be a dialog that is open the first time someone visits.. -->
		<summary>Instructions</summary>
		Each clue hints at a word. (If the clues prove too hard, try switching to
		easy mode!) Fill in the blanks for these clue words with the correct
		letters. The circled letters in each <em>correct</em> clue word will move
		over to the final prompt. <em>Sound out</em> the circled letters as they are
		used in each clue word to reveal the final answer. (Inspo:
		<a href="https://en.wikipedia.org/wiki/Ghoti" target="_blank">ghoti</a> →
		fish) )
	</details>
</template>

<style scoped>
main {
	margin-top: 1rem;
	display: flex;
	flex-wrap: wrap;
	gap: 5rem 2.5rem;
}

h1 {
	display: inline-block;
	margin-right: 0.7em;
}

.final {
	margin-left: auto;
	max-width: 100%;
	flex: 1;
}

.bites {
	flex: 1;
	display: flex;
	flex-direction: column;
	gap: 2.5em;
	margin-top: 0.3em;
	outline: none; /* remove the default focus outline, we'll focus individual letters inside3 */
}

.clue {
	display: flex;
	gap: 0.2rem;
	margin-right: auto;
	max-width: 100%;
}

.bite {
	border: 2px solid var(--color-border);
	/* background: var(--color-input-bg); */
	flex-basis: 3rem;
	aspect-ratio: 1;
	border-radius: 50%;
	text-transform: uppercase;
	align-content: center;
	display: flex;
	place-content: center;
	align-content: center;
	line-height: 1.3;
	font-size: 2rem;

	&.blank {
		visibility: hidden;
	}
}

.answer {
	text-align: center;
	text-transform: uppercase;
	font-size: min(10vw, 2rem);
	width: 9em;
	height: 3rem;
	max-width: 100%;
	margin-top: 0.7em;
	border: 2px solid var(--color-border);
	background: var(--color-input-bg);
	color: var(--color-foreground);
}

.answer:focus-visible {
	border-radius: 1px;
	outline: 2px solid var(--color-accent);
	outline-offset: 2px;
}

.days {
	display: inline-flex;
	flex-wrap: wrap;
	gap: 0.5em 1.2em;

	> a {
		white-space: nowrap;
	}
}

.difficulty {
	display: flex;
	gap: 1em;
	margin-top: 1em;
}

.instructions {
	position: absolute;
	bottom: 2rem;
	right: 2rem;
	max-width: 20em;
	border: 1px solid var(--color-border);
	padding: 1rem;
	background: var(--color-modal-bg);
	box-shadow: 0 4px 10px rgba(0, 0, 10, 0.5);
}

.prize {
	font-size: 2rem;
	padding: 0 0.4em;
}
</style>
