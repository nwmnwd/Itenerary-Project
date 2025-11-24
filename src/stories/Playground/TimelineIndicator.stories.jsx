import React from "react";
import { TimelineExample } from "./TimelineExample";

// Mengubah Title menjadi 'App/TimelineIndicator' untuk menghindari konflik nama 'Example/'
export default {
  title: "App/TimelineIndicator",
  component: TimelineExample,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
  argTypes: {
    initialCurrentIndex: {
      control: { type: "range", min: 0, max: 4, step: 1 },
      description: "Indeks langkah yang sedang aktif.",
    },
    initialCompletedUpTo: {
      control: { type: "range", min: -1, max: 4, step: 1 },
      description:
        "Indeks langkah terakhir yang sudah selesai. -1 berarti belum ada yang selesai.",
    },
  },
};

// --- Stories ---

/**
 * Story: Linimasa Dasar
 * ID Story yang benar: app-timelineindicator--default-timeline
 */
export const DefaultTimeline = {
  args: {
    initialCurrentIndex: 1,
    initialCompletedUpTo: 0,
  },
  render: (args) => <TimelineExample {...args} />,
};

/**
 * Story: Awal Linimasa (Belum Selesai)
 */
export const StartState = {
  args: {
    initialCurrentIndex: 0,
    initialCompletedUpTo: -1, // -1 berarti belum ada yang selesai
  },
  render: (args) => <TimelineExample {...args} />,
};

/**
 * Story: Linimasa Selesai Sebagian
 */
export const PartiallyCompleted = {
  args: {
    initialCurrentIndex: 3,
    initialCompletedUpTo: 2,
  },
  render: (args) => <TimelineExample {...args} />,
};
