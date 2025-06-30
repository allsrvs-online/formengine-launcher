<template>
  <div>
    <div v-if="error">
      <NotFoundView />
    </div>
    <div v-else-if="loading">
      <p>Loading form...</p>
    </div>
    <div v-else>
      <SurveyComponent v-if="surveyJson" :model="surveyJson" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import NotFoundView from "@/views/NotFoundView.vue";
import { Model } from "survey-core";
import { SurveyComponent } from "survey-vue3-ui";
import "survey-core/survey-core.css";
import { PlainLight } from "survey-core/themes";

const route = useRoute();
const loading = ref(true);
const error = ref(false);
const surveyJson = ref<Model | null>(null);

onMounted(async () => {
  try {
    const { tenantId, formId } = route.params;
    const response = await fetch(
      `https://api.formengine.onitnow.allsrvs.online/forms/${tenantId}/${formId}`,
      { headers: { Accept: "application/json" } }
    );
    if (!response.ok) throw new Error("Form not found");
    const apiResponse = await response.json();
    if (apiResponse.statusCode !== 200 || !apiResponse.data?.json)
      throw new Error("Form not found");
    surveyJson.value = new Model(JSON.parse(apiResponse.data.json));
    surveyJson.value.applyTheme(PlainLight);
  } catch {
    error.value = true;
  } finally {
    loading.value = false;
  }
});
</script>
