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

// Local event handlers (safe references)
// eslint-disable-next-line @typescript-eslint/ban-types
const localHandlers: Record<string, Function> = {
  handleComplete: (sender: Model) => {
    alert("Survey completed: " + JSON.stringify(sender.data));
  },
  handleQuestionRender: (sender: Model, options: any) => {
    console.log("Rendered:", options.question.name);
  },
};

onMounted(async () => {
  try {
    const { tenantId, formId } = route.params;
    const response = await fetch(
      `https://api.formengine.onitnow.allsrvs.online/forms/${tenantId}/${formId}`,
      { headers: { Accept: "application/json" } }
    );
    if (!response.ok) throw new Error("Form not found");

    const apiResponse = await response.json();
    const data = apiResponse.data;

    if (apiResponse.statusCode !== 200 || !data?.json)
      throw new Error("Invalid form data");

    const model = new Model(JSON.parse(data.json));

    // Attach default event
    model.onValueChanged.add((sender, options) => {
      console.log("Variable changed:", options.name, options.value);
    });

    // Handle dynamic event binding
    if (Array.isArray(data.events)) {
      for (const { event, handlerName, handler } of data.events) {
        const eventObject = (model as any)[event];
        if (eventObject?.add) {
          // eslint-disable-next-line @typescript-eslint/ban-types
          let fn: Function | null = null;

          if (handler) {
            try {
              fn = new Function("return " + handler)();
            } catch (e) {
              console.error(`Invalid handler for event "${event}"`, e);
            }
          } else if (handlerName && localHandlers[handlerName]) {
            fn = localHandlers[handlerName];
          }

          if (fn) {
            eventObject.add(fn);
          }
        }
      }
    }

    model.applyTheme(PlainLight);
    surveyJson.value = model;
  } catch {
    error.value = true;
  } finally {
    loading.value = false;
  }
});
</script>
