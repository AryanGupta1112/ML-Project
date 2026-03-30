from app.schemas.risk import PatientInput


def generate_recommendations(data: PatientInput) -> list[str]:
    recommendations: list[str] = []

    if data.trestbps >= 130:
        recommendations.append(
            "Your resting blood pressure is high. Cut down salt, stay active, and check blood pressure every week."
        )
    if data.chol >= 200:
        recommendations.append(
            "Your cholesterol is high. Reduce fried and fatty foods, eat more fiber, and discuss follow-up blood tests with your doctor."
        )
    if data.oldpeak >= 2.0:
        recommendations.append(
            "Your ECG stress-change value is high. Ask a heart specialist for a detailed check before heavy exercise."
        )
    if data.thalach <= 120:
        recommendations.append(
            "Your peak heart rate is low. Build regular light-to-moderate cardio activity each week with medical guidance."
        )
    if data.exang == 1:
        recommendations.append(
            "Chest pain with exercise is present. Avoid intense workouts until your doctor says it is safe."
        )
    if data.fbs == 1:
        recommendations.append(
            "Your fasting blood sugar is high. Reduce sugary foods and speak with your doctor about diabetes checks."
        )
    if data.age >= 55:
        recommendations.append(
            "Age can increase heart risk. Keep regular heart checkups and review medicines with your doctor."
        )

    if not recommendations:
        recommendations.append(
            "Your current profile looks stable. Keep exercising, eat well, and continue yearly health checkups."
        )

    return recommendations
