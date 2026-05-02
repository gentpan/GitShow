<template>
  <div class="max-w-3xl mx-auto space-y-2">
    <div
      v-for="item in items" :key="item.id"
      class="flex items-center gap-3 px-4 py-2.5 transition-colors"
      style="background-color: #111; border: 1px solid rgba(255,255,255,0.08);"
      onmouseover="this.style.borderColor='rgba(255,255,255,0.12)'"
      onmouseout="this.style.borderColor='rgba(255,255,255,0.06)'"
    >
      <img :src="item.avatar_url" class="w-8 h-8 shrink-0" />
      <span class="shrink-0 font-medium text-sm" style="color: #fafafa;">{{ item.actor }}</span>
      <span class="shrink-0 text-sm" style="color: #a1a1aa;">
        <template v-if="item.type === 'PushEvent'">pushed to</template>
        <template v-else-if="item.type === 'CreateEvent'">{{ item.action }} in</template>
        <template v-else-if="item.type === 'PullRequestEvent'">{{ item.action }} in</template>
        <template v-else-if="item.type === 'IssuesEvent'">{{ item.action }} in</template>
        <template v-else-if="item.type === 'WatchEvent'">{{ item.action }}</template>
        <template v-else-if="item.type === 'ForkEvent'">{{ item.action }}</template>
        <template v-else-if="item.type === 'ReleaseEvent'">{{ item.action }} in</template>
        <template v-else>{{ item.action || item.type }}</template>
      </span>
      <a :href="item.repo_url" target="_blank" class="hover:underline text-sm truncate" style="color: #16a34a;">
        {{ item.repo }}
      </a>
      <span class="text-xs ml-auto shrink-0" style="color: #52525b;">{{ timeAgo(item.created_at) }}</span>
    </div>
    <div v-if="!items?.length" class="text-sm py-6 text-center" style="color: #a1a1aa;">暂无近期动态</div>
  </div>
</template>

<script setup>
const { timeAgo } = useUtils()

const props = defineProps({
  items: { type: Array, default: () => [] }
})
</script>
