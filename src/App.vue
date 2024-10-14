<script setup>
import { ref, reactive, computed, watch, onMounted, nextTick } from 'vue'
import SoundBite from './components/SoundBite.vue'
import { days, ANSWER_INDEX } from './data.js'

// todo:
// 1. only fill out bites if the whole word is correct
// 2. add sound files to correct words to clarify pronunciation

let url = new URL(location.href)
let activeDay = ref(Number.parseInt(url.searchParams.get('q')) || 1)

// this will come from server or something
let data = computed(() => days[activeDay.value - 1].data)

let clues = computed(() => data.value.slice(0, -1))

let ipa = computed(() => data.value.at(-1)[0])
let solution = computed(() => data.value.at(-1)[1])

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

let guesses = computed(() =>
	clues.value.map(([, answer]) => new Array(answer.length).fill(' ')),
)

let selectedGuess = computed(() => guesses.value[selectedWordIndex.value])

let clueEls = ref([])

let selectedWordIndex = ref(0)
let selectedLetterIndex = ref(0)

watch(selectedWordIndex, (index) => {
	if (index < 0) selectedWordIndex.value = clues.value.length - 1
	if (index >= clues.value.length) selectedWordIndex.value = 0
	selectedLetterIndex.value =
		selectedGuess.value.findIndex((letter) => letter === ' ') || 0
})
let selectedWord = computed(
	() => clues.value[selectedWordIndex.value][ANSWER_INDEX],
)

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
	if (
		selectedLetterIndex.value > 0 &&
		selectedGuess.value[selectedLetterIndex.value] === ' '
	) {
		// if they're on a blank space, they probably wanted to delete the previous letter
		selectedGuess.value.splice(selectedLetterIndex.value - 1, 1, ' ')
		selectedLetterIndex.value -= 1
	} else {
		// else delete the current letter and stay where we are.
		guesses.value[selectedWordIndex.value].splice(
			selectedLetterIndex.value,
			1,
			' ',
		)
	}
}

function handleInput(e) {
	if (e.keyCode < 65 || !/\p{L}/u.test(e.key)) return
	guesses.value[selectedWordIndex.value].splice(
		selectedLetterIndex.value,
		1,
		e.key,
	)
	selectedLetterIndex.value += 1
}

let answer = ref('')
async function checkAnswer() {
	if (answer.value.toLowerCase() === solution.value.toLowerCase()) {
		console.debug(ipa.value)
		await nextTick()
		alert('You win!')
	}
}

let difficulty = ref(0)

window.addEventListener('popstate', (e) => {
	activeDay.value = e.state.day
})
let go = (day) => {
	activeDay.value = day
	history.pushState({ day }, '', `?q=${day}`)
}
</script>

<template>
	<header>
		<h1 style="display: inline-block">Sound Bites</h1>
		<span class="days">
			<a
				v-for="(day, i) in days"
				:key="i"
				tabindex="0"
				:href="`?q=${i + 1}`"
				:class="{ day: true, active: activeDay === i + 1 }"
				@click.prevent="go(i + 1)"
			>
				{{ day.name }}
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
			:inert="false"
		>
			<SoundBite
				v-for="([clue, answer, bites], index) in clues"
				ref="clueEls"
				:key="index"
				:clue="clue[difficulty]"
				:answer="answer"
				:bites="bites"
				:guess="guesses[index]"
				:selected="selectedWordIndex === index"
				:selected-letter-index="selectedLetterIndex"
				@select-word="selectedWordIndex = index"
				@select-letter="(index) => (selectedLetterIndex = index)"
				autofocus="true"
				:padding="longest"
			/>
		</div>

		<div class="final">
			<div class="clue">
				<span
					class="bite"
					v-for="(letter, index) in clues
						.map(([, , bites], index) => {
							if (guesses[index].join('') === answers[index])
								return guesses[index].slice(bites[0], bites[1]).join('')
							else return new Array(bites[1] - bites[0]).fill(' ').join('')
						})
						.join('')"
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
			<input v-model="answer" @input="checkAnswer" class="answer" />
		</div>
	</main>

	<details class="instructions">
		<summary>instructions</summary>
		Each clue hints at a word. Fill in the blanks with the correct letters. The
		circled letters in each correct word will move over to the final answer.
		Sound out the circled letters as they are used in each word to reveal the
		final answer.
	</details>
</template>

<style scoped>
/* todo: make letters not change size when they are filled in */
main {
	margin-top: 1rem;
	display: flex;
	flex-wrap: wrap;
	gap: 5rem 2.5rem;
}
.final {
	/* flex-grow: 1; */
	/* flex-shrink: 0; */
	margin-left: auto;
	max-width: 100%;
	flex: 1;
}

.bites {
	flex: 1;
	display: flex;
	flex-direction: column;
	gap: 1.2rem;
	/* margin-right: auto; */
}

.clue {
	display: flex;
	gap: 0.2rem;
	margin-right: auto;
	max-width: 100%;
}

.bite {
	border: 2px solid var(--color-border);
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
	margin-top: 1.5rem;
	border: 2px solid var(--color-border);
	background: var(--color-background);
	color: var(--color-foreground);
}

.answer:focus-visible {
	border-radius: 1px;
	outline: 2px solid var(--color--accent);
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
	background: #111;
}
</style>
