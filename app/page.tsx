import { FeedbackForm } from '@/components/feedback-form';

export default function Page() {
  return (
    <main className="container">
      <section className="card">
        <h1>Metagri フィードバック</h1>
        <p className="lead">
          Metagri研究所の更なる進化に向けて率直なご意見をお願いします。匿名でも送信できます。
        </p>
        <FeedbackForm />
      </section>
    </main>
  );
}
