import React, { useState, useEffect } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, Image, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function HobbyTracker({ hobbySlug }: { hobbySlug?: string }) {
  const routeParams = useLocalSearchParams();
  const hobby = hobbySlug || (routeParams.hobby as string);

  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const screenWidth = Dimensions.get('window').width;
  const daySize = screenWidth / 7 - 8;
  const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];

  const [completedDaysMap, setCompletedDaysMap] = useState<Record<string, Set<string>>>({});
  const [goldenDaysMap, setGoldenDaysMap] = useState<Record<string, Set<string>>>({}); // ✅ altın günler
  const [treeLevel, setTreeLevel] = useState<number>(1);

  const levelThresholds: Record<number, number> = { 1:5, 2:15, 3:30, 4:45, 5:60 };

  // (opsiyonel) Altın gün işaretleme helper'ı — post atıldıysa çağırırsın
  const markGolden = async (dateKey: string, value: boolean) => {
    try {
      await fetch(`https://de6f82654550.ngrok-free.app/api/progress/${hobby}/golden`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: dateKey, value })
      });
      // local state’i güncelle
      setGoldenDaysMap(prev => {
        const cur = prev[hobby] || new Set<string>();
        const next = new Set(cur);
        if (value) next.add(dateKey); else next.delete(dateKey);
        return { ...prev, [hobby]: next };
      });
    } catch (e) {
      console.warn('golden update failed', e);
    }
  };

  useEffect(() => {
    const loadProgress = async () => {
      const res = await fetch(`https://de6f82654550.ngrok-free.app/api/progress/${hobby}`);
      const data = await res.json();
      // ✅ hem tamamlanan günler hem de altın günler
      const daySet = new Set<string>(data.map((x: any) => x.date));
      const goldenSet = new Set<string>(data.filter((x: any) => x.isGolden).map((x: any) => x.date));
      setCompletedDaysMap(prev => ({ ...prev, [hobby]: daySet }));
      setGoldenDaysMap(prev => ({ ...prev, [hobby]: goldenSet }));
    };

    const loadLevel = async () => {
      try {
        const res = await fetch(`https://de6f82654550.ngrok-free.app/api/progress/${hobby}/level`);
        const data = await res.json();
        const level = data.level ?? data.data?.level ?? 1;
        setTreeLevel(level);
      } catch (err) {
        console.error("Tree level yüklenemedi:", err);
        setTreeLevel(1);
      }
    };

    loadProgress();
    loadLevel();
  }, [hobby]);

  const getDaysInMonth = (month: number, year: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (month: number, year: number) => (new Date(year, month, 1).getDay() + 6) % 7;

  const toggleDay = async (day: number) => {
    const dayKey = `${selectedYear}-${selectedMonth}-${day}`;
    const currentSet = completedDaysMap[hobby] || new Set();
    const newSet = new Set(currentSet);
    const isMarked = newSet.has(dayKey);
    const method = isMarked ? 'DELETE' : 'POST';

    await fetch(`https://de6f82654550.ngrok-free.app/api/progress/${hobby}`, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date: dayKey })
    });

    isMarked ? newSet.delete(dayKey) : newSet.add(dayKey);

    setCompletedDaysMap(prev => ({ ...prev, [hobby]: newSet }));

    // Gün silindiyse altın bayrağı da düşür (UI tutarlılığı)
    if (isMarked) {
      setGoldenDaysMap(prev => {
        const cur = prev[hobby] || new Set<string>();
        const next = new Set(cur);
        next.delete(dayKey);
        return { ...prev, [hobby]: next };
      });
    }

    const res = await fetch(`https://de6f82654550.ngrok-free.app/api/progress/${hobby}/level`);
    const data = await res.json();
    setTreeLevel(data.level);
  };

  const getMonthlyProgress = () => {
    const currentHobbyDays = completedDaysMap[hobby] || new Set();
    const daysInMonth = getDaysInMonth(selectedMonth, selectedYear);
    const completedThisMonth = Array.from(currentHobbyDays).filter(day =>
      day.startsWith(`${selectedYear}-${selectedMonth}-`)
    ).length;
    return (completedThisMonth / daysInMonth) * 100;
  };

  const getTreeImage = () => {
    const images: Record<number, any> = {
      1: require('../../assets/images/tree/tree1.png'),
      2: require('../../assets/images/tree/tree2.png'),
      3: require('../../assets/images/tree/tree3.png'),
      4: require('../../assets/images/tree/tree4.png'),
      5: require('../../assets/images/tree/tree5.png'),
      6: require('../../assets/images/tree/tree6.png'),
    };
    return images[treeLevel] || images[1];
  };

  const getTreeMessage = () => {
    const messages = [
      'Our seed has been planted!',
      'Our seed is sprouting!',
      'Our sapling is growing!',
      'Our tree is growing!',
      'Our tree is blossoming!',
      'Our tree is about to bear fruit!',
      'Our tree has borne fruit. Congratulations !!!'
    ];
    return messages[treeLevel] || messages[0];
  };

  const quotes = [
    "Success is the sum of small efforts, repeated day in and day out.",
    "Discipline is doing what needs to be done, even when you don’t feel like it.",
    "Dream big. Start small. Act now.",
    "Small steps every day lead to big results.",
    "Progress, not perfection.",
    "Stay consistent and trust the process.",
    "You don’t have to be extreme, just consistent.",
    "Little by little, a little becomes a lot.",
    "Don’t count the days, make the days count.",
    "Push yourself, because no one else is going to do it for you.",
    "Success doesn’t come from what you do occasionally. It comes from what you do consistently.",
    "It’s never too late to start.",
    "Great things never come from comfort zones.",
    "One day or day one. You decide.",
    "The journey of a thousand miles begins with a single step."
  ];

  const getRandomQuote = () => {
    const today = new Date().getDate();
    return quotes[today % quotes.length];
  };

  const remaining = levelThresholds[treeLevel]
    ? levelThresholds[treeLevel] - (completedDaysMap[hobby]?.size || 0)
    : 0;

  const navigateMonth = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      selectedMonth === 0 ? (setSelectedMonth(11), setSelectedYear(selectedYear - 1)) : setSelectedMonth(selectedMonth - 1);
    } else {
      selectedMonth === 11 ? (setSelectedMonth(0), setSelectedYear(selectedYear + 1)) : setSelectedMonth(selectedMonth + 1);
    }
  };

  const renderCalendarDays = () => {
    const currentHobbyDays = completedDaysMap[hobby] || new Set();
    const goldenDaysSet = goldenDaysMap[hobby] || new Set(); // ✅ altın gün set’i
    const daysInMonth = getDaysInMonth(selectedMonth, selectedYear);
    const firstDay = getFirstDayOfMonth(selectedMonth, selectedYear);
    const days = [];

    for (let i = 0; i < firstDay; i++) {
      days.push(<View key={`empty-${i}`} style={[styles.emptyDay, { width: daySize, height: daySize }]} />);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dayKey = `${selectedYear}-${selectedMonth}-${day}`;
      const isCompleted = currentHobbyDays.has(dayKey);
      const isGolden = goldenDaysSet.has(dayKey); // ✅ bugünün altın mı?
      const isToday =
        day === new Date().getDate() &&
        selectedMonth === new Date().getMonth() &&
        selectedYear === new Date().getFullYear();

      days.push(
        <TouchableOpacity
          key={day}
          style={[
            styles.dayButton,
            { width: daySize, height: daySize },
            isCompleted && styles.completedDay,
            isToday && styles.todayBorder,
          ]}
          onPress={() => toggleDay(day)}
        >
          <Text style={[styles.dayText, isCompleted && styles.completedDayText]}>{day}</Text>
          {isCompleted && (
            isGolden
              ? <Ionicons name="star" size={16} color="#FFD700" style={styles.checkIcon} /> // ⭐ altın gün
              : <Ionicons name="checkmark" size={16} color="#fff" style={styles.checkIcon} />
          )}
        </TouchableOpacity>
      );
    }

    return days;
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Hobby Tracker</Text>
        </View>

        <View style={styles.treeSection}>
          <Text style={styles.treeSectionTitle}>🌳 My Tree 🌳</Text>
          <View style={styles.treeContainer}>
            <View style={styles.treeDisplay}>
              <Image source={getTreeImage()} style={styles.treeImage} />
              <Text style={styles.treeLevel}>Level {treeLevel}</Text>
            </View>
            <View style={styles.treeInfo}>
              <Text style={styles.treeMessage}>{getTreeMessage()}</Text>
              <Text style={styles.treeProgress}>{completedDaysMap[hobby]?.size || 0} day completed. Keep going !</Text>
              {treeLevel < 6 && remaining > 0 && (
                <Text style={styles.nextLevelText}>For next level {remaining} day left!</Text>
              )}
            </View>
          </View>
          <View style={styles.treeLevelProgress}>
            <Text style={styles.progressLabel}>Tree Growth Progress</Text>
            <View style={styles.levelProgressBar}>
              <View style={[styles.levelProgressFill, { width: `${(treeLevel / 5) * 100}%` }]} />
            </View>
            <View style={styles.levelDots}>
              {[1, 2, 3, 4, 5].map((level) => (
                <View key={level} style={[styles.levelDot, treeLevel >= level && styles.activeLevelDot]} />
              ))}
            </View>
          </View>
        </View>

        <View style={styles.progressSection}>
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>{Math.round(getMonthlyProgress())}%</Text>
              <Text style={styles.statLabel}>This month</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}> {completedDaysMap[hobby]?.size || 0}</Text>
              <Text style={styles.statLabel}>Total</Text>
            </View>
          </View>

          <View style={styles.progressContainer}>
            <Text style={styles.progressLabel}>Monthly Progress Bar</Text>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${getMonthlyProgress()}%` }]} />
            </View>
            <Text style={styles.progressText}>
              {Array.from(completedDaysMap[hobby] || []).filter(
                day => day.startsWith(`${selectedYear}-${selectedMonth}-`)
              ).length}
              / {getDaysInMonth(selectedMonth, selectedYear)} day completed
            </Text>
          </View>
        </View>

        <View style={styles.calendarSection}>
          <View style={styles.monthHeader}>
            <TouchableOpacity onPress={() => navigateMonth('prev')}>
              <Ionicons name="chevron-back" size={24} color="#D4611A" />
            </TouchableOpacity>
            <Text style={styles.monthTitle}>
              {months[selectedMonth]} {selectedYear}
            </Text>
            <TouchableOpacity onPress={() => navigateMonth('next')}>
              <Ionicons name="chevron-forward" size={24} color="#D4611A" />
            </TouchableOpacity>
          </View>

          <View style={styles.weekDaysRow}>
            {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map((day) => (
              <Text key={day} style={styles.weekDayText}>{day}</Text>
            ))}
          </View>

          <View style={styles.calendarGrid}>
            {renderCalendarDays()}
          </View>
        </View>

        <View style={styles.motivationSection}>
          <Text style={styles.motivationText}>{getRandomQuote()}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

/* Not: styles objende `checkIcon` zaten varmış; yoksa ekle:
checkIcon: { position: 'absolute', right: 4, bottom: 4 }
*/

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF8E7',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#8B4513',
    marginBottom: 5,
  },
  hobbySelector: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#8B4513',
    marginBottom: 10,
  },
  hobbyButton: {
    backgroundColor: '#FFE5B4',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#E6C068',
  },
  selectedHobbyButton: {
    backgroundColor: '#D4611A',
    borderColor: '#D4611A',
  },
  hobbyButtonText: {
    color: '#8B4513',
    fontSize: 14,
    fontWeight: '500',
  },
  selectedHobbyButtonText: {
    color: '#fff',
  },
  progressSection: {
    marginHorizontal: 20,
    marginTop: 25,
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  statBox: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#D4611A',
  },
  statLabel: {
    fontSize: 12,
    color: '#8B4513',
    marginTop: 2,
  },
  progressContainer: {
    alignItems: 'center',
  },
  progressLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8B4513',
    marginBottom: 10,
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: '#FFE5B4',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#D4611A',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: '#8B4513',
    marginTop: 8,
  },
  calendarSection: {
    marginHorizontal: 20,
    marginTop: 25,
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  monthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  navButton: {
    padding: 5,
  },
  monthTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#8B4513',
  },
  weekDaysRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 15,
  },
  weekDayText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#D4611A',
    width: 35,
    textAlign: 'center',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  emptyDay: {
    margin: 2,
  },
  dayButton: {
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 2,
    backgroundColor: '#FFE5B4',
    position: 'relative',
  },
  completedDay: {
    backgroundColor: '#D4611A',
  },
  todayBorder: {
    borderWidth: 2,
    borderColor: '#F4A261',
  },
  dayText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#8B4513',
  },
  completedDayText: {
    color: '#fff',
  },
  checkIcon: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#2E8B57',
    borderRadius: 8,
    width: 16,
    height: 16,
    textAlign: 'center',
    textAlignVertical: 'center',
  },
  motivationSection: {
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 30,
    backgroundColor: '#F4A261',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
  },
  motivationText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
  },
  treeSection: {
    marginHorizontal: 20,
    marginTop: 25,
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  treeSectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#8B4513',
    marginBottom: 15,
    textAlign: 'center',
  },
  treeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  treeDisplay: {
    alignItems: 'center',
    marginRight: 20,
  },
  treeLevel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#D4611A',
  },
  treeInfo: {
    flex: 1,
  },
  treeMessage: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8B4513',
    marginBottom: 5,
  },
  treeProgress: {
    fontSize: 14,
    color: '#D4611A',
    marginBottom: 3,
  },
  nextLevelText: {
    fontSize: 12,
    color: '#F4A261',
    fontStyle: 'italic',
  },
  treeLevelProgress: {
    alignItems: 'center',
  },
  levelProgressBar: {
    width: '100%',
    height: 6,
    backgroundColor: '#FFE5B4',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 10,
  },
  levelProgressFill: {
    height: '100%',
    backgroundColor: '#2E8B57',
    borderRadius: 3,
  },
  levelDots: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  levelDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FFE5B4',
    borderWidth: 2,
    borderColor: '#E6C068',
  },
  activeLevelDot: {
    backgroundColor: '#2E8B57',
    borderColor: '#2E8B57',
  },
  treeImage: {
    width: 100,
    height: 100,
    resizeMode: 'contain',
    marginBottom: 10,
  },
});
