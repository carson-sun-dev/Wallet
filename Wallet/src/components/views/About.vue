<template>
  <div class="about-page">
    <el-card class="about-card">
      <el-result icon="success" title="About App">
        <template #sub-title>
          <p>Version v1.0.2</p>
          <p>A minimalist personal accounting system.</p>
        </template>
        <template #extra>
          <el-button type="primary" class="back-home-btn" @click="$router.push('/home')">
            Back to Home
          </el-button>
        </template>
      </el-result>
    </el-card>
  </div>
</template>

<style scoped>
.about-page {
  min-height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 24px;
  background: var(--app-bg);
}

.about-card {
  width: 100%;
  max-width: 500px;
  background: var(--app-card-bg);
  border: 1px solid var(--app-border);
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
}

html.dark .about-card {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.back-home-btn {
  background: var(--app-primary) !important;
  border-color: var(--app-primary) !important;
  padding: 12px 28px;
  font-weight: 600;
}

:deep(.el-result__extra) {
  margin-top: 20px;
}
</style>
