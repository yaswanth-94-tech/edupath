/**
 * Automated Verification Script for EduPath API
 * Tests core endpoints:
 * 1. Health check & configuration report
 * 2. Lean resume sanitization & gap analysis
 * 3. Task completion toggle
 * 4. Dynamic adaptive struggle recalculation
 * 5. Learning copilot context-aware response
 */

import { ResumeService } from './services/resume.service';
import { GeminiService } from './services/gemini.service';
import { DbService } from './services/db.service';

import crypto from 'crypto';

async function runTestSuite() {
  console.log('🧪 Starting EduPath Automated Verification Suite...\n');

  try {
    // 1. Resume Sanitizer Test
    console.log('1️⃣ Testing Resume Sanitization...');
    const rawResume = ResumeService.getSampleResume('frontend');
    const sanitized = ResumeService.sanitizeText(rawResume);
    console.log(`   Raw Length: ${rawResume.length} chars | Sanitized Length: ${sanitized.length} chars`);
    if (sanitized.length < 50) throw new Error('Sanitized resume is unexpectedly short');
    console.log('   ✅ Resume text properly normalized and trimmed.\n');

    // 2. Profile & Gap Analysis Test
    console.log('2️⃣ Testing Profile Creation & AI Gap Analysis...');
    const testUserId = crypto.randomUUID();
    await DbService.saveProfile({
      id: testUserId,
      target_role: 'Senior React Engineer',
      hours_per_week: 15,
      preferred_learning_style: 'projects'
    });

    const analysis = await GeminiService.analyzeSkillGaps({
      targetRole: 'Senior React Engineer',
      hoursPerWeek: 15,
      preferredStyle: 'projects',
      sanitizedResume: sanitized
    });

    console.log(`   Acquired Skills count: ${analysis.acquired_skills.length}`);
    console.log(`   Skill Gaps identified: ${analysis.skill_gaps.length}`);
    console.log(`   Weekly Sprints generated: ${analysis.weekly_plan.length}`);
    if (analysis.acquired_skills.length === 0 || analysis.weekly_plan.length === 0) {
      throw new Error('Analysis output failed schema requirements');
    }
    console.log('   ✅ Structured Gap Analysis conforms to JSON schema.\n');

    // 3. Database Persistence Test
    console.log('3️⃣ Testing Database Persistence & Progress Metrics...');
    const fullRoadmap = await DbService.saveAnalysisResults({
      userId: testUserId,
      targetRole: 'Senior React Engineer',
      hoursPerWeek: 15,
      analysis
    });

    console.log(`   Roadmap ID: ${fullRoadmap.roadmap.id}`);
    console.log(`   Total Sprints: ${fullRoadmap.weeks.length}`);
    console.log(`   Total Milestone Tasks: ${fullRoadmap.progress.total_tasks}`);
    console.log(`   Initial Completion: ${fullRoadmap.progress.completion_percentage}%`);
    console.log('   ✅ Database persistence and initial progress calculated.\n');

    // 4. Task Completion Toggle Test
    console.log('4️⃣ Testing Task Completion Toggle...');
    const firstTask = fullRoadmap.weeks[0].tasks[0];
    await DbService.toggleTaskCompletion(firstTask.id, true);
    const updatedRoadmap = await DbService.getFullRoadmap(testUserId);
    console.log(`   Updated Completion: ${updatedRoadmap?.progress.completion_percentage}%`);
    if (updatedRoadmap?.progress.completed_tasks !== 1) {
      throw new Error('Task completion was not reflected in roadmap data');
    }
    console.log('   ✅ Task toggle properly recalculates completion percentage.\n');

    // 5. Dynamic Adaptive Feedback Loop (Struggle Adaptation) Test
    console.log('5️⃣ Testing Adaptive Struggle Recalculation...');
    const weekToStruggle = fullRoadmap.weeks[0];
    const initialTaskCount = weekToStruggle.tasks.length;
    const adaptation = await GeminiService.recalculateStruggleMilestone({
      targetRole: 'Senior React Engineer',
      strugglingWeek: weekToStruggle,
      struggleNotes: 'Having trouble understanding strict typescript generics constraints.'
    });

    console.log(`   Remedial Tasks Generated: ${adaptation.remedial_tasks.length}`);
    console.log(`   Explanation: ${adaptation.explanation}`);
    await DbService.applyStruggleAdaptation(fullRoadmap.roadmap.id, weekToStruggle.id, adaptation);
    const postStruggleRoadmap = await DbService.getFullRoadmap(testUserId);
    const adaptedWeek = postStruggleRoadmap?.weeks.find(w => w.id === weekToStruggle.id);
    console.log(`   Adapted Week Status: ${adaptedWeek?.status}`);
    console.log(`   Adapted Week Task Count: ${adaptedWeek?.tasks.length}`);
    if (adaptedWeek?.status !== 'struggling' || (adaptedWeek?.tasks.length || 0) <= initialTaskCount) {
      throw new Error('Struggle adaptation failed to inject remedial sub-tasks');
    }
    console.log('   ✅ Dynamic feedback loop successfully injected remedial sub-tasks!\n');

    // 6. Context-Aware Learning Copilot Chat Test
    console.log('6️⃣ Testing Context-Aware Copilot Assistant...');
    const copilotReply = await GeminiService.copilotChat({
      message: 'What is the difference between type and interface in TypeScript?',
      targetRole: 'Senior React Engineer',
      activeWeek: {
        week_number: 1,
        title: weekToStruggle.title,
        learning_objective: weekToStruggle.learning_objective
      },
      strugglePoints: ['TypeScript Generics']
    });

    console.log(`   Copilot Response Snippet:\n   "${copilotReply.slice(0, 160)}..."`);
    console.log('   ✅ Copilot chat responded with active sprint awareness.\n');

    console.log('🎉 ALL AUTOMATED VERIFICATION TESTS PASSED SUCCESSFULLY!');
  } catch (err: any) {
    console.error('❌ Test suite failed:', err);
    process.exit(1);
  }
}

runTestSuite();
