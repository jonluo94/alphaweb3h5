import { ss } from '@/utils/storage'

const LOCAL_NAME = 'pictureStore'

export type PictureList = []

export interface PictureStore {
	pictureList: PictureList
}

export function getLocalPictureList(): PictureStore {
	const pictureStore: PictureStore | undefined = ss.get(LOCAL_NAME)
	return pictureStore ?? { pictureList: [] }
}

export function setLocalPictureList(pictureStore: PictureStore): void {
	ss.set(LOCAL_NAME, pictureStore)
}
