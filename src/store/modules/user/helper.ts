import {ss} from '@/utils/storage'
import defaultAvatar from '@/assets/avatar.jpg'
const LOCAL_NAME = 'userStorage'

export interface UserInfo {
	description: string
	userName?: string// 用户名
	roleId?: number// 角色
	headImageUrl?: string//头像url
	vipLevel?: string//vip等级
	vipExpireTime?: string//vip过期时间
	imageCount?: string//剩余图片使用次数
	userAccount?: string//账号（用于记住密码选项）
	userPassword?: string // 密码 （用于记住密码选项）
	balance?: number//用户余额
}

export interface UserState {
	userInfo: UserInfo
}

export function defaultSetting(): UserState {
	return {
		userInfo: {
			headImageUrl: defaultAvatar,
			userName: 'Tester',
			description: '',
		},
	}
}

export function getLocalState(): UserState {
	const localSetting: UserState | undefined = ss.get(LOCAL_NAME)
	return {...defaultSetting(), ...localSetting}
}

export function setLocalState(setting: UserState): void {
	ss.set(LOCAL_NAME, setting)
}
