/**
 * Alarms Screen
 * Displays list of alarms with add/cancel functionality
 */

import React, {useState, useEffect} from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  useColorScheme,
  TouchableOpacity,
  Alert,
  Modal,
  Platform,
  Switch,
} from 'react-native';
import DateTimePicker, {
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import {StackNavigationProp} from '@react-navigation/stack';
import AlarmService, {AlarmData} from '../services/AlarmService';

type RootStackParamList = {
  Home: undefined;
  Alarms: undefined;
};

type AlarmsScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, 'Alarms'>;
};

function AlarmsScreen({navigation}: AlarmsScreenProps): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';

  const [alarms, setAlarms] = useState<AlarmData[]>([]);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showRepeatModal, setShowRepeatModal] = useState(false);
  const [selectedTime, setSelectedTime] = useState<Date>(new Date());
  const [repeatEnabled, setRepeatEnabled] = useState(false);

  const backgroundStyle = {
    backgroundColor: isDarkMode ? '#000000' : '#ffffff',
    flex: 1,
  };

  const textStyle = {
    color: isDarkMode ? '#ffffff' : '#000000',
  };

  // Load alarms on mount
  useEffect(() => {
    loadAlarms();
  }, []);

  const loadAlarms = async () => {
    try {
      const loadedAlarms = await AlarmService.getInstance().getAllAlarms();
      // Sort by time
      loadedAlarms.sort((a, b) => a.time.getTime() - b.time.getTime());
      setAlarms(loadedAlarms);
    } catch (error) {
      console.error('Error loading alarms:', error);
      Alert.alert('Error', 'Failed to load alarms');
    }
  };

  const handleAddAlarmPress = () => {
    // Default to 1 minute from now for easy testing
    const defaultTime = new Date();
    defaultTime.setMinutes(defaultTime.getMinutes() + 1);
    setSelectedTime(defaultTime);
    setRepeatEnabled(false); // Reset repeat toggle
    setShowTimePicker(true);
  };

  const handleTimeChange = (event: DateTimePickerEvent, date?: Date) => {
    if (Platform.OS === 'android') {
      setShowTimePicker(false);
    }

    if (date && event.type === 'set') {
      setSelectedTime(date);
      if (Platform.OS === 'android') {
        // Android: show repeat modal after time selection
        setShowRepeatModal(true);
      }
    }
  };

  const handleSaveAlarm = async (time?: Date) => {
    const alarmTime = time || selectedTime;
    setShowTimePicker(false);
    setShowRepeatModal(false);

    try {
      const newAlarm: AlarmData = {
        id: `alarm-${Date.now()}`,
        time: alarmTime,
        enabled: true,
        repeat: repeatEnabled,
        label: `Alarm ${alarmTime.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
        })}`,
      };

      await AlarmService.getInstance().scheduleAlarm(newAlarm);
      await loadAlarms();

      Alert.alert(
        'Alarm Set',
        `Alarm scheduled for ${alarmTime.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
        })}`,
      );
    } catch (error) {
      console.error('Error saving alarm:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      Alert.alert('Error', errorMessage);
    }
  };

  const handleCancelAlarm = async (alarmId: string) => {
    try {
      await AlarmService.getInstance().deleteAlarm(alarmId);
      await loadAlarms();
    } catch (error) {
      console.error('Error cancelling alarm:', error);
      Alert.alert('Error', 'Failed to cancel alarm');
    }
  };

  const confirmCancelAlarm = (alarm: AlarmData) => {
    Alert.alert(
      'Cancel Alarm',
      `Cancel alarm for ${alarm.time.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      })}?`,
      [
        {text: 'No', style: 'cancel'},
        {text: 'Yes', onPress: () => handleCancelAlarm(alarm.id)},
      ],
    );
  };

  return (
    <SafeAreaView style={backgroundStyle}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundStyle.backgroundColor}
      />
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}>
            <Text style={[styles.backButtonText, textStyle]}>← Back</Text>
          </TouchableOpacity>
          <Text style={[styles.title, textStyle]}>Alarms</Text>
        </View>

        {/* Alarm List */}
        <ScrollView style={styles.content}>
          {alarms.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyText, textStyle]}>No alarms set</Text>
              <Text style={[styles.emptySubtext, textStyle]}>
                Tap the + button to add an alarm
              </Text>
            </View>
          ) : (
            alarms.map(alarm => (
              <View
                key={alarm.id}
                style={[
                  styles.alarmCard,
                  {backgroundColor: isDarkMode ? '#1a1a1a' : '#f5f5f5'},
                ]}>
                <View style={styles.alarmInfo}>
                  <View style={styles.alarmTimeRow}>
                    <Text style={[styles.alarmTime, textStyle]}>
                      {alarm.time.toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true,
                      })}
                    </Text>
                    {alarm.repeat && (
                      <Text style={styles.repeatIcon}>🔄</Text>
                    )}
                  </View>
                  {alarm.label && (
                    <Text style={[styles.alarmLabel, textStyle]}>
                      {alarm.label}
                    </Text>
                  )}
                  <Text style={[styles.alarmDate, textStyle]}>
                    {alarm.time.toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => confirmCancelAlarm(alarm)}>
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            ))
          )}
        </ScrollView>

        {/* Add Alarm Button */}
        <TouchableOpacity
          style={[
            styles.addButton,
            {backgroundColor: isDarkMode ? '#007AFF' : '#007AFF'},
          ]}
          onPress={handleAddAlarmPress}>
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>

        {/* Time Picker Modal (iOS) */}
        {Platform.OS === 'ios' && (
          <Modal
            visible={showTimePicker}
            transparent={true}
            animationType="slide">
            <View style={styles.modalOverlay}>
              <View
                style={[
                  styles.modalContent,
                  {backgroundColor: isDarkMode ? '#1a1a1a' : '#ffffff'},
                ]}>
                <Text style={[styles.modalTitle, textStyle]}>Set Alarm Time</Text>
                <DateTimePicker
                  value={selectedTime}
                  mode="time"
                  display="spinner"
                  onChange={handleTimeChange}
                  textColor={isDarkMode ? '#ffffff' : '#000000'}
                  style={styles.timePicker}
                />
                <View style={styles.repeatToggleContainer}>
                  <Text style={[styles.repeatLabel, textStyle]}>Repeat Daily</Text>
                  <Switch
                    value={repeatEnabled}
                    onValueChange={setRepeatEnabled}
                    trackColor={{false: '#767577', true: '#81b0ff'}}
                    thumbColor={repeatEnabled ? '#007AFF' : '#f4f3f4'}
                  />
                </View>
                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.cancelModalButton]}
                    onPress={() => setShowTimePicker(false)}>
                    <Text style={styles.cancelModalButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.setAlarmButton]}
                    onPress={() => handleSaveAlarm()}>
                    <Text style={styles.setAlarmButtonText}>Set Alarm</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        )}

        {/* Time Picker (Android) */}
        {Platform.OS === 'android' && showTimePicker && (
          <DateTimePicker
            value={selectedTime}
            mode="time"
            display="default"
            onChange={handleTimeChange}
          />
        )}

        {/* Repeat Modal (Android) */}
        {Platform.OS === 'android' && (
          <Modal
            visible={showRepeatModal}
            transparent={true}
            animationType="slide">
            <View style={styles.modalOverlay}>
              <View
                style={[
                  styles.modalContent,
                  {backgroundColor: isDarkMode ? '#1a1a1a' : '#ffffff'},
                ]}>
                <Text style={[styles.modalTitle, textStyle]}>
                  Alarm at {selectedTime.toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true,
                  })}
                </Text>
                <View style={styles.repeatToggleContainer}>
                  <Text style={[styles.repeatLabel, textStyle]}>Repeat Daily</Text>
                  <Switch
                    value={repeatEnabled}
                    onValueChange={setRepeatEnabled}
                    trackColor={{false: '#767577', true: '#81b0ff'}}
                    thumbColor={repeatEnabled ? '#007AFF' : '#f4f3f4'}
                  />
                </View>
                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.cancelModalButton]}
                    onPress={() => setShowRepeatModal(false)}>
                    <Text style={styles.cancelModalButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.setAlarmButton]}
                    onPress={() => handleSaveAlarm()}>
                    <Text style={styles.setAlarmButtonText}>Set Alarm</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 16,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    flex: 1,
  },
  content: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 16,
    opacity: 0.6,
  },
  alarmCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  alarmInfo: {
    flex: 1,
  },
  alarmTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  alarmTime: {
    fontSize: 28,
    fontWeight: 'bold',
    marginRight: 8,
  },
  repeatIcon: {
    fontSize: 20,
  },
  alarmLabel: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 2,
  },
  alarmDate: {
    fontSize: 12,
    opacity: 0.5,
  },
  cancelButton: {
    backgroundColor: '#FF3B30',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  cancelButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  addButton: {
    position: 'absolute',
    right: 24,
    bottom: 54,
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  addButtonText: {
    color: '#ffffff',
    fontSize: 36,
    fontWeight: '300',
    marginTop: -4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    paddingBottom: 40,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 20,
    textAlign: 'center',
  },
  timePicker: {
    height: 200,
    marginBottom: 20,
  },
  repeatToggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
    marginBottom: 20,
  },
  repeatLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  cancelModalButton: {
    backgroundColor: '#8E8E93',
  },
  cancelModalButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  setAlarmButton: {
    backgroundColor: '#34C759',
  },
  setAlarmButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AlarmsScreen;
