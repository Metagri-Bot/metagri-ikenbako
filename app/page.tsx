import { FeedbackForm } from '@/components/feedback-form';

export default function Page() {
  return (
    <main className="container">
      <section className="card">
        <h1>Metagri フィードバック</h1>
        <p className="lead">
          プロダクト改善のために、率直なご意見をお願いします。匿名でも送信できます。
        </p>
        <FeedbackForm />
      </section>
    </main>
  );
}
