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

let selectedWordIndex = ref(0)
let selectedLetterIndex = ref(0)

watch(selectedWordIndex, (index) => {
	if (index < 0) selectedWordIndex.value = clues.value.length - 1
	if (index >= clues.value.length) selectedWordIndex.value = 0
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
	() => clues.value[selectedWordIndex.value][ANSWER_INDEX],
)

// loop back to start or end of word if we go out of bounds
watch(selectedLetterIndex, (index, oldIndex) => {
	if (index < 0) selectedLetterIndex.value = selectedWord.value.length - 1
	if (index >= selectedWord.value.length) selectedLetterIndex.value = 0
	if (
		index === 0 &&
		oldIndex !== 1 &&
		!selectedGuess.value.some((char) => char === ' ')
	) {
		// let nextIncompleteWordIndex =
		// todo: advance to the next blank space in the next word, if there is one, or to the final input if not
		selectedWordIndex.value += 1
	}
})

function handleDelete() {
	if (selectedGuess.value[selectedLetterIndex.value] === ' ') {
		// if they're on a blank space, they probably wanted to delete the previous letter
		if (selectedLetterIndex.value > 0) {
			selectedGuess.value.splice(selectedLetterIndex.value - 1, 1, ' ')
			selectedLetterIndex.value -= 1
		} else {
			selectedWordIndex.value -= 1
			selectedLetterIndex.value = -1
			selectedGuess.value.splice(selectedLetterIndex.value, 1, ' ')
		}
	} else {
		// else delete the current letter and stay where we are.
		todaysGuesses.value[selectedWordIndex.value].splice(
			selectedLetterIndex.value,
			1,
			' ',
		)
	}
}

function handleInput(e) {
	if (e.keyCode < 65 || !/\p{L}/u.test(e.key)) return
	todaysGuesses.value[selectedWordIndex.value].splice(
		selectedLetterIndex.value,
		1,
		e.key,
	)
	selectedLetterIndex.value += 1
}

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
</script>

<template>
	<header>
		<h1 style="display: inline-block">Sound Bites</h1>
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
			@keyup="handleInput"
			:inert="guessedBites === correctBites"
			autofocus
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
				autofocus="true"
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
	margin-left: 1em;
	display: inline-flex;
	gap: 1.2em;
}

.difficulty {
	display: flex;
	gap: 1em;
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
