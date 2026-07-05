import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Card, Button, LoadingSpinner } from '../../../shared/components';
import { profilesStore } from '../../../core/storage/profiles-store';
import { colors, spacing, radius, fontFamily, fontFamilySemiBold, fontFamilyBold } from '../../../shared/theme';

interface SetupStep {
  id: number;
  titleKey: string;
  descriptionKey: string;
  icon: keyof typeof Feather.glyphMap;
  route: string;
  completed: boolean;
  required?: boolean;
}

export function SetupStepper() {
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState(0);

  const hasFamilyProfile = profilesStore.getFamilyMemberId() !== null;
  const hasPatient = profilesStore.getLinkedPatientId() !== null;

  const steps: SetupStep[] = [
    {
      id: 1,
      titleKey: 'setup.step1.title',
      descriptionKey: 'setup.step1.description',
      icon: 'user',
      route: '/(auth)/setup/profile',
      completed: hasFamilyProfile,
      required: true,
    },
    {
      id: 2,
      titleKey: 'setup.step2.title',
      descriptionKey: 'setup.step2.description',
      icon: 'heart',
      route: '/(auth)/setup/patient',
      completed: hasPatient,
      required: true,
    },
    {
      id: 3,
      titleKey: 'setup.step3.title',
      descriptionKey: 'setup.step3.description',
      icon: 'link',
      route: '/(auth)/setup/patient',
      completed: hasPatient,
      required: true,
    },
    {
      id: 4,
      titleKey: 'setup.step4.title',
      descriptionKey: 'setup.step4.description',
      icon: 'activity',
      route: '/(auth)/setup/doctor',
      completed: false,
      required: false,
    },
  ];

  const handleStepPress = (step: SetupStep) => {
    router.push(step.route as any);
  };

  const handleFinish = () => {
    router.replace('/(family)/dashboard' as any);
  };

  const allCompleted = steps.every((step) => step.required === false || step.completed);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>{t('setup.title')}</Text>
      <Text style={styles.subtitle}>{t('setup.subtitle')}</Text>

      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              { width: `${(steps.filter((s) => s.completed).length / steps.length) * 100}%` },
            ]}
          />
        </View>
        <Text style={styles.progressText}>
          {steps.filter((s) => s.completed).length} / {steps.length} {t('setup.completed')}
        </Text>
      </View>

      <View style={styles.stepsContainer}>
        {steps.map((step, index) => (
          <TouchableOpacity
            key={step.id}
            onPress={() => handleStepPress(step)}
            activeOpacity={0.7}
            disabled={step.completed}
          >
            <Card style={step.completed ? { ...styles.stepCard, ...styles.stepCardCompleted } : styles.stepCard}>
              <View style={styles.stepHeader}>
                <View
                  style={[
                    styles.stepNumber,
                    step.completed ? styles.stepNumberCompleted : styles.stepNumberPending,
                  ]}
                >
                  {step.completed ? (
                    <Feather name="check" size={20} color="#fff" />
                  ) : (
                    <Text style={styles.stepNumberText}>{index + 1}</Text>
                  )}
                </View>
                <View style={[styles.stepIcon, { backgroundColor: step.completed ? '#dcfce7' : '#dbeafe' }]}>
                  <Feather
                    name={step.icon}
                    size={24}
                    color={step.completed ? '#16a34a' : colors.primary}
                  />
                </View>
              </View>
              <View style={styles.stepContent}>
                <Text style={[styles.stepTitle, step.completed && styles.stepTitleCompleted]}>
                  {t(step.titleKey)}
                </Text>
                <Text style={styles.stepDescription}>{t(step.descriptionKey)}</Text>
              </View>
              {!step.completed && (
                <View style={styles.stepArrow}>
                  <Feather name="chevron-right" size={20} color={colors.textMuted} />
                </View>
              )}
            </Card>
          </TouchableOpacity>
        ))}
      </View>

      {allCompleted && (
        <Button
          title={t('setup.finish')}
          onPress={handleFinish}
          style={styles.finishButton}
          icon="check-circle"
        />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg },
  title: { fontFamily: fontFamilyBold, fontSize: 24, color: colors.textPrimary, letterSpacing: -0.5, marginBottom: spacing.xs },
  subtitle: { fontFamily, fontSize: 14, color: colors.textMuted, marginBottom: spacing.xl },
  progressContainer: { marginBottom: spacing.xl },
  progressBar: { height: 8, backgroundColor: colors.borderLight, borderRadius: radius.full, overflow: 'hidden', marginBottom: spacing.sm },
  progressFill: { height: '100%', backgroundColor: colors.primary, borderRadius: radius.full },
  progressText: { fontFamily, fontSize: 13, color: colors.textMuted, textAlign: 'right' },
  stepsContainer: { gap: spacing.md },
  stepCard: { flexDirection: 'row', alignItems: 'center', padding: spacing.lg },
  stepCardCompleted: { backgroundColor: '#f0fdf4', borderColor: '#bbf7d0' },
  stepHeader: { marginRight: spacing.md },
  stepNumber: { width: 32, height: 32, borderRadius: radius.full, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.sm },
  stepNumberCompleted: { backgroundColor: '#16a34a' },
  stepNumberPending: { backgroundColor: colors.primaryLight },
  stepNumberText: { fontFamily: fontFamilyBold, fontSize: 14, color: colors.primary },
  stepIcon: { width: 48, height: 48, borderRadius: radius.lg, alignItems: 'center', justifyContent: 'center' },
  stepContent: { flex: 1 },
  stepTitle: { fontFamily: fontFamilySemiBold, fontSize: 16, color: colors.textPrimary, marginBottom: 2 },
  stepTitleCompleted: { color: '#16a34a' },
  stepDescription: { fontFamily, fontSize: 13, color: colors.textMuted },
  stepArrow: { marginLeft: spacing.sm },
  finishButton: { marginTop: spacing.xl },
});
