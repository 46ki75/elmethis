import type { Meta, StoryObj } from '@storybook/vue3'
import ElmBlockImage from './ElmBlockImage.vue'

const meta: Meta<typeof ElmBlockImage> = {
  title: 'Components/Media/ElmBlockImage',
  component: ElmBlockImage,
  tags: ['autodocs'],
  args: {
    src: 'https://images.unsplash.com/photo-1556983703-27576e5afa24?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb',
    alt: '朝焼けか夕焼けかわからない写真'
  }
}

export default meta
type Story = StoryObj<typeof meta>

export const Primary: Story = {}

export const Svg: Story = {
  args: {
    src: 'https://nuxt.com/cdn-cgi/image/w=1024,h=878/assets/landing/deploy.svg',
    alt: 'Deploy your app anywhere'
  }
}

export const LongAlt: Story = {
  args: {
    src: 'https://nuxt.com/cdn-cgi/image/w=1024,h=878/assets/landing/deploy.svg',
    alt: 'One-command deployments and zero-configuration options make it easy to get your Nuxt app live. Choose your platform, and let Nuxt handle the rest, allowing you to focus on building great applications rather than managing complex deployments.'
  }
}

export const Invalid: Story = {
  args: {
    src: 'invalid'
  }
}
