import type { Store } from "../store/state";

const DONE_KEY = "iq-onboarding-done";

interface Stage {
  title: string;
  body: string;
  onEnter?: () => void;
}

/**
 * The 4-beat onboarding — spec-ui/07 stages 1–4 (0:00–0:60), compressed
 * into a skippable guided tour. Stages 5–6 (hours 2–10, 10+ hours) are
 * deliberately not part of onboarding — they describe *mastery*, reached
 * through ordinary use of the lens rail, audits, and locks already built,
 * not a scripted tour step.
 */
export class Onboarding {
  private el: HTMLElement;
  private card: HTMLElement;
  private stageIdx = 0;
  private stages: Stage[];

  constructor(mount: HTMLElement, private store: Store) {
    this.el = document.createElement("div");
    this.el.className = "onboarding";
    this.el.hidden = true;
    this.card = document.createElement("div");
    this.card.className = "onboarding__card reveal";
    this.el.appendChild(this.card);
    mount.appendChild(this.el);

    this.stages = [
      {
        title: "الصفحة كصفحة",
        body: "خمسة عشر سطرًا، هوامش، فجوات — كما تُسلَّم دائمًا. لا شيء يتحرك بعد. الوعد الوحيد الآن: هذه الصفحة لن تنكسر. كلّ ما سيحدث يحدث داخلها.",
        onEnter: () => { this.store.update({ focusedLane: null }); },
      },
      {
        title: "العدسة الأولى",
        body: "اضغط مطولًا في إحدى الفجوات بين السطرين. ضغطٌ خفيف يُظهر خيوطًا رفيعة؛ أثقل فأثقل يُظهر الهيكل ثم الجذور. سطرٌ ثابت الآن؛ جرِّب.",
      },
      {
        title: "تنعطف الأصوات",
        body: "تقدَّم بتركيزك سطرًا فسطرًا. حين يبلغ سطرًا فيه انعطاف، يدفأ لونه وينقسم صفًّا صفًّا — انظر إلى المؤشر في الهامش الأيسر وهو يعبر المحور.",
      },
      {
        title: "الهيكل تحت العلامات",
        body: "اقرص بإصبعين عبر السطور. تذوب العلامات من نقطة القرص إلى الخارج، ويبقى الهيكل عاريًا على حقلٍ رمادي. افرد إصبعيك فتعود العلامات — نقطة نقطة.",
      },
    ];

    this.renderStage();
  }

  start(): void {
    if (localStorage.getItem(DONE_KEY) === "1") return;
    this.el.hidden = false;
    this.stageIdx = 0;
    this.renderStage();
  }

  replay(): void {
    this.el.hidden = false;
    this.stageIdx = 0;
    this.renderStage();
  }

  private renderStage(): void {
    const stage = this.stages[this.stageIdx];
    stage.onEnter?.();
    this.card.innerHTML = `
      <div class="onboarding__title">${stage.title} — ${this.stageIdx + 1}/${this.stages.length}</div>
      <p class="onboarding__body">${stage.body}</p>
      <div class="onboarding__actions">
        <button class="onboarding__btn hit-44" data-act="skip">تخطَّ الجولة</button>
        <button class="onboarding__btn onboarding__btn--primary hit-44" data-act="next">${this.stageIdx === this.stages.length - 1 ? "تمّ" : "التالي"}</button>
      </div>`;
    this.card.querySelector('[data-act="next"]')!.addEventListener("click", () => this.next());
    this.card.querySelector('[data-act="skip"]')!.addEventListener("click", () => this.finish());
  }

  private next(): void {
    if (this.stageIdx < this.stages.length - 1) {
      this.stageIdx += 1;
      this.renderStage();
    } else {
      this.finish();
    }
  }

  private finish(): void {
    this.el.hidden = true;
    try { localStorage.setItem(DONE_KEY, "1"); } catch { /* private mode: tour just replays next load, harmless */ }
  }
}
