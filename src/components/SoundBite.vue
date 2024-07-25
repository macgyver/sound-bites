<script setup>
import { defineProps, defineEmits, ref, reactive, watch } from 'vue'

let props = defineProps({
	clue: {
		type: String,
		required: true,
	},
	answer: {
		type: String,
		required: true,
	},
	bites: {
		type: Array,
		required: true,
	},
	selected: {
		type: Boolean,
		required: true,
	},
	selectedLetterIndex: {
		type: Number,
		default: 0,
	},
	guess: {
		type: Array,
		required: true,
	},
})

let emit = defineEmits(['select-word', 'select-letter'])
</script>

<template>
	<div
		class="sound-bite"
		:class="{ selected }"
		@click="emit('select-word')"
		tabindex="0"
		@focus="emit('select-word')"
	>
		<label class="clue">{{ clue }}</label>
		<span class="answer">
			<span
				class="letter"
				v-for="(letter, index) in answer"
				:key="index"
				:class="{
					bite: index >= bites[0] && index < bites[1],
					selected: selected && selectedLetterIndex === index,
				}"
				@click="emit('select-letter', index)"
				>{{ guess[index] }}</span
			>
		</span>
	</div>
</template>

<style scoped>
.sound-bite {
	/* display: flex; */
	--girth: 2px;
	font-size: 2rem;

	/* don't worry we will make it real obvious which is the active one */
	&:focus-visible {
		outline: none;
	}
	/* margin-top: 1.2em; */
}

.clue {
	line-height: 1.2;
}

.answer {
	display: flex;
	gap: 0.1em;
	margin-left: auto;
}

.letter {
	.selected & {
		/* background-color: cyan; */
	}

	&.selected {
		outline: 2px solid cyan;
		outline-offset: 2px;
	}

	height: 3rem;
	aspect-ratio: 1;
	/* padding: 1rem; */
	border: var(--girth) solid black;
	position: relative;
	text-transform: uppercase;
	line-height: 1;
	align-content: center;
	padding: 0px 0.4em;
	font-size: 2rem;
}

.bite {
	&::after {
		content: '';
		position: absolute;
		top: calc(-0.9 * var(--girth));
		bottom: calc(-0.9 * var(--girth));
		right: calc(-0.9 * var(--girth));
		left: calc(-0.9 * var(--girth));
		border: var(--girth) solid black;
		border-radius: 50%;
	}
}
</style>
