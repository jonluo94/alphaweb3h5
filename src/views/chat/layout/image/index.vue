<script lang="ts" setup>
import {
	NAvatar,
	NBadge,
	NButton,
	NCard,
	NCol,
	NForm,
	NFormItem,
	NImage,
	NInput,
	NModal,
	NPagination,
	NPopover, NPopselect, NRow, NSlider, NStatistic, NSwitch, NTabPane, NTabs, useDialog, useMessage,
} from 'naive-ui'
import {computed, onBeforeMount, onMounted, reactive, ref} from 'vue'
import {useAuthStoreWithout} from '@/store/modules/auth'
import {useSignalR} from '@/views/chat/hooks/useSignalR'
import SubmitFooter from '@/components/common/SubmitFooter/submitFooter.vue'
import {HoverButton, SvgIcon} from '@/components/common'
import type {SubmitDTO} from '@/api'
import {GenerateGraph, MyImageList, ShareImage, ShareImageList} from '@/api'
import {usePictureStore, useUserStore} from "@/store";
import PromptRecommend from "@/assets/recommend.json";
// 定义后端接口的地址
import {t} from '@/locales'
const apiUrl = import.meta.env.VITE_GLOB_API_URL
const authStore = useAuthStoreWithout()
const modelTypeOptions: Array<{ label: string; value: number }> = [
	{label: 'SD', value: 0},
]
const modelOptions: Array<{ label: string; value: string }> = [
	{label: '二次元', value: '二次元'},
	{label: '真人', value: '真人'},
]
const userStore = useUserStore()
const pictureStore = usePictureStore()

const selectedTab = ref('chap1')
const showModal = ref(false)

const loading = ref<boolean>(false)
const dialog = useDialog()

const page = ref(1)
const pageSize = ref(10)
const totalPage = ref(0)

const ms = useMessage()
// signalR
const {waitingCount, connection, imgUrl, start} = useSignalR("")

const formData = reactive<SubmitDTO>({
	prompt: '',
	count: 1,
	size: 512,
	negativePrompt: authStore.imgKey ?? '',
	modelType: 0,
	connectionId: null,
	model: null,
})

const submit = async () => {
	formData.connectionId = connection.value?.connectionId
	loading.value = true
	const {picture} = await GenerateGraph(formData)
	if (picture == "data:image/png;base64,") {
		ms.error("绘画失败")
		loading.value = false
	} else {
		ms.success("绘画成功")
		let list = pictureStore.pictureList
		list.push(picture)
		pictureStore.updatePictureList(list)
		userStore.refreshUserInfo()
		loading.value = false
	}

}

const PublicChange = async (imageRecordId: number, isPublic: boolean) => {
	const {data} = await ShareImage(imageRecordId, isPublic)
	if (data)
		ms.success('操作成功')
}

const loadPosts = async () => {
	let response
	console.log("+++++++++++loadPosts")
	switch (selectedTab.value) {
		case 'chap1':
			let list = pictureStore.pictureList
			response = {data: {items: list}}
			break
	}
	// 设置请求头
	const {data} = response
	if (data.items != null) {
		imgUrl.value = data.items
		totalPage.value = Math.ceil(data.total / pageSize.value)
	}
}
const updatePage = (p: number) => {
	page.value = p
	loadPosts()
}

// 删除所有记录
function handleClear() {
	dialog.warning({
		title: t('chat.clearDraw'),
		content: t('chat.clearDrawConfirm'),
		positiveText: t('common.yes'),
		negativeText: t('common.no'),
		onPositiveClick: () => {
			pictureStore.updatePictureList([])
			loadPosts()
		},
	})
}

const buttonDisabled = computed(() => {
	return loading.value || !formData.prompt || formData.prompt.trim() === ''
})

const changeBoolean = (imageUrl: any) => {
	if (imageUrl.islike == null)
		imageUrl.islike = true
	else
		imageUrl.islike = !imageUrl.islike
}
onMounted(() => {
	loadPosts()
})
onBeforeMount(() => {
	// 在组件加载时调用 start 方法
	start()
})
</script>

<template>
	<div class="h-full relative">
		<NTabs v-model:value="selectedTab" type="segment">
			<NTabPane name="chap1" tab="我的绘画"/>
		</NTabs>
		<div
			id="image-scroll-container"
			style="
		      overflow: auto;
		      display: flex;
		      flex-wrap: wrap;
		      gap: 8px;
		    "
		>
			<NCard v-for="(imageUrl, index) in imgUrl" :key="index" shadow="hover"
						 style="margin-bottom: 10px;max-width: 300px;" hoverable>
				<template #cover>
					<NImage
						width="512"
						height="512"
						lazy
						:src="imageUrl"
						:intersection-observer-options="{
              root: '#image-scroll-container',
            }"
					>
						<template #placeholder>
							<div
								style="
						width: 100px;
						height: 100px;
						display: flex;
						align-items: center;
						justify-content: center;
						background-color: #0001;
					"
							>
								Loading
							</div>
						</template>
					</NImage>
				</template>
			</NCard>
		</div>
		<div v-if="totalPage > 0" class="pagination-wrap w-full"
				 style="display: flex; justify-content: center; margin-top: 8px;">
			<NPagination
				:page="page"
				:page-slot="5"
				:page-count="totalPage"
				@update:page="updatePage"
			/>
		</div>
		<div class="absolute bottom-0 w-full">
			<SubmitFooter
				v-model="formData.prompt"
				placeholder="请输入图片描述词"
				:search-options="[]"
				:render-option="null"
				:button-disabled="buttonDisabled"
				:show-token="false"
				:counter="500"
				@submit="submit"
			>
				<NPopselect
					v-model:value="formData.modelType" :options="modelTypeOptions" trigger="click"
					:on-update:value="(value) => { formData.modelType = value;formData.count = 1 }"
				>
					<NButton>{{ modelTypeOptions.find(i => i.value === formData.modelType)?.label || '请选择模型' }}</NButton>
				</NPopselect>
				<HoverButton @click="handleClear">
        <span class="text-xl text-[#4f555e] dark:text-white">
          <SvgIcon icon="ri:delete-bin-line"/>
        </span>
				</HoverButton>
				<!--        <NPopselect-->
				<!--          v-model:value="formData.model" :options="modelOptions" trigger="click"-->
				<!--          :on-update:value="(value) => { formData.model = value;formData.count = 1 }"-->
				<!--        >-->
				<!--          <NButton>{{ modelOptions.find(i => i.value === formData.model)?.label || '请选择模型' }}</NButton>-->
				<!--        </NPopselect>-->
				<!--        <HoverButton @click="showModal = true">-->
				<!--          <span class="text-xl text-[#4f555e] dark:text-white">-->
				<!--            <NPopover trigger="hover">-->
				<!--              <template #trigger>-->
				<!--                <SvgIcon icon="ri:settings-4-line" />-->
				<!--              </template>-->
				<!--              <span>或许不想知道你的花园长得咋样</span>-->
				<!--            </NPopover>-->
				<!--          </span>-->
				<!--        </HoverButton>-->
			</SubmitFooter>
		</div>

		<NModal v-model:show="showModal" style="width: 90%; max-width: 600px;" preset="card">
			<NForm
				label-placement="left"
				label-width="auto"
				require-mark-placement="right-hanging"
			>
				<NFormItem label="反向提示词" path="negativePrompt">
					<NInput v-model:value="formData.negativePrompt"/>
				</NFormItem>
				<NFormItem label="生成图片数量">
					<NSlider v-model:value="formData.count" :max="10" :min="1"/>
				</NFormItem>
			</NForm>
		</NModal>
	</div>
</template>
