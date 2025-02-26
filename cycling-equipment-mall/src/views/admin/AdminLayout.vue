<template>
    <!-- No changes to template section -->
</template>

<script>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

export default {
    setup() {
        const router = useRouter()
        const handleLogout = () => {
            localStorage.removeItem('adminToken')
            localStorage.removeItem('adminUserInfo')
            router.push('/admin/login')
        }
        return { handleLogout }
    }
}
</script>

<style>
/* No changes to style section */
</style>