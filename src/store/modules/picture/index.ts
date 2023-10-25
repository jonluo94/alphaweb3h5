import { defineStore } from 'pinia'
import type { PictureStore } from './helper'
import { getLocalPictureList, setLocalPictureList } from './helper'

export const usePictureStore = defineStore('picture-store', {
	state: (): PictureStore => getLocalPictureList(),

	actions: {
		updatePictureList(pictureList: []) {
			this.$patch({ pictureList })
			setLocalPictureList({ pictureList })
		},
		getPictureList() {
			return this.$state
		},
	},
})
