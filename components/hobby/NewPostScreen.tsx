import React, { useMemo, useState, useRef, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView, Image, TextInput, Alert, Vibration, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { CameraView, useCameraPermissions, useMicrophonePermissions } from "expo-camera";
import * as MediaLibrary from "expo-media-library";
import * as Haptics from "expo-haptics";
import Svg, { Circle } from "react-native-svg";
import { Video, ResizeMode } from "expo-av";
import { useNavigation, useRoute } from "@react-navigation/native";

// ===== Types =====
type MediaKind = "text" | "photo" | "video";
type SourceKind = "camera" | "gallery" | null;

// ===== Screen =====
export default function NewPostScreen() {
  // Steps
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Nav
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const incomingHobby: string | undefined = route.params?.hobby || route.params?.hobbySlug;

  // Selections
  const [mediaKind, setMediaKind] = useState<MediaKind | null>(null);
  const [hobby, setHobby] = useState<string | null>(null);

  // Source + video length
  const [source, setSource] = useState<SourceKind>(null);
  const [videoDuration, setVideoDuration] = useState<15 | 30 | null>(null);

  // Content
  const [pickedUri, setPickedUri] = useState<string | null>(null);
  const [videoClips, setVideoClips] = useState<string[] | null>(null);
  const [caption, setCaption] = useState("");
  const [categoryTags, setCategoryTags] = useState<string[]>([]);

  // Recorder
  const [showRecorder, setShowRecorder] = useState(false);

  // Hobby from route
  useEffect(() => {
    if (!incomingHobby) {
      Alert.alert("Hobby missing", "Bu sayfaya bir hobi sayfasından gelmelisin.");
    } else {
      setHobby(incomingHobby);
    }
  }, [incomingHobby]);

  // Auto hashtag
  const hobbyTag = useMemo(
    () => (hobby ? `#${hobby.toLowerCase().replace(/\s+/g, "")}` : null),
    [hobby]
  );

  // Guards
  const canNextFromStep1 = useMemo(() => {
    if (!hobby) return false;
    if (mediaKind === "text") return true;
    return !!mediaKind;
  }, [mediaKind, hobby]);

  const canNextFromStep2 = useMemo(() => {
    if (mediaKind === "photo") return !!source;
    if (mediaKind === "video") {
      if (!source) return false;
      if (source === "camera") return !!videoDuration;
      return true;
    }
    return true;
  }, [mediaKind, source, videoDuration]);

  const toggleCategory = (t: string) => {
    setCategoryTags(prev => (prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]));
  };

  // Permissions + pickers
  async function ensurePermissions(kind: "camera" | "gallery") {
    try {
      if (kind === "camera") {
        const cam = await ImagePicker.requestCameraPermissionsAsync();
        if (cam.status !== "granted") throw new Error("Camera permission denied");
      } else {
        const lib = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (lib.status !== "granted") throw new Error("Library permission denied");
      }
    } catch (e: any) {
      Alert.alert("Permission", e?.message || "Permission required.");
      throw e;
    }
  }

  async function pickFromGallery(kind: "photo" | "video", limitSec?: number) {
    await ensurePermissions("gallery");
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: kind === "photo" ? ImagePicker.MediaTypeOptions.Images : ImagePicker.MediaTypeOptions.Videos,
      allowsEditing: true,
      quality: 0.8,
    });
    if (res.canceled) return null;

    const asset = res.assets[0];
    let duration = (asset as any).duration as number | undefined;

    if (!duration && (asset as any).assetId) {
      const perm = await MediaLibrary.requestPermissionsAsync();
      if (perm.status === "granted") {
        try {
          const info = await MediaLibrary.getAssetInfoAsync((asset as any).assetId);
          duration = (info as any)?.duration;
        } catch {}
      }
    }

    if (kind === "video" && limitSec && duration && duration > limitSec) {
      Alert.alert("Video too long", `Please select a video up to ${limitSec} seconds.`);
      return null;
    }
    return { uri: asset.uri, type: asset.type };
  }

  async function capturePhotoWithCamera() {
    await ensurePermissions("camera");
    const res = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });
    if (!res.canceled) {
      const asset = res.assets[0];
      return { uri: asset.uri, type: asset.type };
    }
    return null;
  }

  // Next / Post
  const handleNext = async () => {
    if (step === 1 && canNextFromStep1) {
      if (mediaKind === "text") {
        setStep(3);
      } else {
        setStep(2);
      }
      return;
    }

    if (step === 2 && canNextFromStep2) {
      if (mediaKind === "video" && source === "camera") {
        setShowRecorder(true);
        return;
      }

      let picked: { uri: string; type?: string } | null = null;

      if (mediaKind === "photo") {
        picked = source === "camera" ? await capturePhotoWithCamera() : await pickFromGallery("photo");
      } else if (mediaKind === "video") {
        const maxSec = videoDuration || 15;
        picked = await pickFromGallery("video", maxSec);
      }

      if (picked) {
        setPickedUri(picked.uri);
        setVideoClips(null);
        setStep(3);
      }
      return;
    }

    if (step === 3) {
      console.log({
        hobby,
        mediaKind,
        source,
        videoDuration,
        pickedUri,
        videoClips,
        caption,
        hobbyTag,
        categoryTags,
      });
      Alert.alert("Post", "Payload logged to console 👍");
    }
  };

  // Preview uri
  const previewUri = useMemo(() => {
    if (mediaKind === "photo") return pickedUri || null;
    if (mediaKind === "video") {
      if (videoClips && videoClips.length > 0) return videoClips[0];
      return pickedUri || null;
    }
    return null;
  }, [mediaKind, pickedUri, videoClips]);

  const nextDisabled = (step === 1 && !canNextFromStep1) || (step === 2 && !canNextFromStep2);

  return (
    <>
      <ScrollView style={styles.screen}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => {
              if (showRecorder) { setShowRecorder(false); return; }
              if (step > 1) { setStep(p => (p === 3 ? 2 : 1)); return; }
              navigation.goBack();
            }}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            accessibilityRole="button"
            accessibilityLabel="Geri"
          >
            <Ionicons name="chevron-back" size={22} color={"#8B4513"} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>New Post</Text>
          <TouchableOpacity
            disabled={nextDisabled}
            onPress={handleNext}
            style={[styles.nextBtn, nextDisabled && styles.nextBtnDisabled]}
          >
            <Text style={styles.nextBtnText}>{step < 3 ? "Next" : "Post"}</Text>
          </TouchableOpacity>
        </View>

        {/* STEP 1: Type only (hobby comes from route) */}
        {step === 1 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>What would you like to share?</Text>

            <View style={styles.row}>
              <OptionBig title="Photo" desc="Share a moment from your hobby" selected={mediaKind === "photo"} onPress={() => setMediaKind("photo")} />
              <OptionBig title="Video" desc="Capture a short clip" selected={mediaKind === "video"} onPress={() => setMediaKind("video")} />
            </View>

            <View style={styles.rowMarginTop12}>
              <OptionBig title="Text" desc="Share your thoughts" selected={mediaKind === "text"} onPress={() => setMediaKind("text")} />
            </View>
          </View>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Choose Your Media Source</Text>
            <View style={styles.row}>
              <OptionBig title="Camera" desc="" selected={source === "camera"} onPress={() => setSource("camera")} />
              <OptionBig title="Gallery" desc="" selected={source === "gallery"} onPress={() => setSource("gallery")} />
            </View>

            {mediaKind === "video" && source === "camera" && (
              <>
                <Text style={styles.videoDurationTitle}>Video Duration</Text>
                <View style={styles.row}>
                  <Chip text="15 seconds" selected={videoDuration === 15} onPress={() => setVideoDuration(15)} />
                  <Chip text="30 seconds" selected={videoDuration === 30} onPress={() => setVideoDuration(30)} />
                </View>
              </>
            )}
          </View>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <View style={styles.card}>
            {/* Media Preview */}
            {mediaKind !== "text" && (
              previewUri ? (
                mediaKind === "photo" ? (
                  <Image source={{ uri: previewUri }} style={styles.previewImage} resizeMode="cover" />
                ) : (
                  <Video
                    source={{ uri: previewUri }}
                    style={styles.previewVideo}
                    useNativeControls
                    resizeMode={ResizeMode.CONTAIN}
                    isLooping
                  />
                )
              ) : (
                <View style={styles.mediaSummary}>
                  <Ionicons name="camera" size={18} color={"#8B4513"} />
                  <Text style={styles.mediaSummaryText}>
                    {source === "camera" ? "Captured" : "From gallery"}
                  </Text>
                </View>
              )
            )}

            {mediaKind === "video" && videoClips && videoClips.length > 1 && (
              <Text style={styles.clipsInfo}>{videoClips.length} clips captured</Text>
            )}

            <Text style={styles.captionTitle}>Write Your Caption</Text>
            <TextInput
              style={styles.caption}
              placeholder="Share your experience, thoughts, or tips..."
              placeholderTextColor={"rgba(0,0,0,0.5)"}
              value={caption}
              onChangeText={setCaption}
              multiline
              maxLength={500}
            />
            <Text style={styles.counter}>{caption.length}/500</Text>

            <Text style={styles.hobbyTagTitle}>Hobby Tag</Text>
            <View style={styles.row}>
              <Chip text={hobbyTag || "#hobby"} selected onPress={() => {}} />
            </View>

            <Text style={styles.categoryTitle}>Category Tags (Optional)</Text>
            <View style={styles.rowWrap}>
              {["#educational", "#daily", "#tip", "#review", "#progress", "#inspiration"].map(t => (
                <Chip key={t} text={t} selected={categoryTags.includes(t)} onPress={() => toggleCategory(t)} />
              ))}
            </View>
          </View>
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Video Recorder */}
      <VideoRecorderModal
        visible={showRecorder}
        duration={(videoDuration || 15) as 15 | 30}
        onCancel={() => setShowRecorder(false)}
        onDone={(uris) => {
          setShowRecorder(false);
          setVideoClips(uris);
          setPickedUri(uris[0] ?? null);
          setStep(3);
        }}
      />
    </>
  );
}

// ===== Small UI bits =====
function OptionBig({
  title, desc, selected, onPress,
}: { title: string; desc: string; selected?: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity onPress={onPress} style={[styles.option, selected && styles.optionActive]}>
      <Text style={styles.optionTitle}>{title}</Text>
      {!!desc && <Text style={styles.optionDesc}>{desc}</Text>}
    </TouchableOpacity>
  );
}

function Chip({
  text, selected, onPress, textStyle,
}: { text: string; selected?: boolean; onPress: () => void; textStyle?: any }) {
  return (
    <TouchableOpacity onPress={onPress} style={[styles.chip, selected && styles.chipActive]}>
      <Text style={[styles.chipText, selected && styles.chipTextSelected, textStyle]}>{text}</Text>
    </TouchableOpacity>
  );
}

// ===== Recorder Modal (pause/resume + delete last + countdown) =====
function VideoRecorderModal({
  visible, duration, onCancel, onDone,
}: { visible: boolean; duration: 15 | 30; onCancel: () => void; onDone: (uris: string[]) => void }) {
  const camRef = useRef<any>(null);
  const [camPerm, requestCamPerm] = useCameraPermissions();
  const [micPerm, requestMicPerm] = useMicrophonePermissions();

  const [facing, setFacing] = useState<"front" | "back">("back");
  const [recording, setRecording] = useState(false);
  const [paused, setPaused] = useState(false);

  const [clips, setClips] = useState<string[]>([]);
  const [clipDurations, setClipDurations] = useState<number[]>([]);

  const [baseElapsed, setBaseElapsed] = useState(0);
  const [runStart, setRunStart] = useState<number | null>(null);

  const liveElapsed = recording && runStart ? baseElapsed + (Date.now() - runStart) / 1000 : baseElapsed;
  const elapsed = Math.min(liveElapsed, duration);
  const left = Math.max(0, Math.ceil(duration - elapsed));
  const progress = Math.min(elapsed / duration, 1);

  // last 3s haptic
  useEffect(() => {
    if (recording && left <= 3 && left > 0) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => Vibration.vibrate(30));
    }
  }, [left, recording]);

  // permissions
  useEffect(() => {
    (async () => {
      if (!camPerm?.granted) await requestCamPerm();
      if (!micPerm?.granted) await requestMicPerm();
    })();
  }, [camPerm, micPerm, requestCamPerm, requestMicPerm]);

  if (!visible) return null;

  const ensurePerms = async () => {
    const camOk = camPerm?.granted || (await requestCamPerm())?.granted;
    const micOk = micPerm?.granted || (await requestMicPerm())?.granted;
    if (!camOk || !micOk) {
      Alert.alert("Permission", "Camera and microphone permissions are required.");
      return false;
    }
    return true;
  };

  const prevElapsedAfter = (segDur: number) => Math.min(duration, baseElapsed + segDur);

  // start/resume segment
  const startSegment = async () => {
    if (!camRef.current || elapsed >= duration) return;
    if (!(await ensurePerms())) return;

    setPaused(false);
    setRecording(true);
    const startedAt = Date.now();
    setRunStart(startedAt);

    const maxSeg = Math.max(1, duration - Math.floor(elapsed));
    const cam: any = camRef.current;

    if (typeof cam.startRecording === "function") {
      cam.startRecording({
        maxDuration: maxSeg,
        onRecordingFinished: (video: any) => {
          const segDur = (Date.now() - startedAt) / 1000;
          if (video?.uri) {
            setClips(prev => [...prev, video.uri]);
            setClipDurations(prev => [...prev, segDur]);
          }
          setBaseElapsed(prev => Math.min(duration, prev + segDur));
          setRunStart(null);
          setRecording(false);

          if (prevElapsedAfter(segDur) >= duration) finalize();
          else setPaused(true);
        },
        onRecordingError: (e: any) => {
          setRunStart(null);
          setRecording(false);
          Alert.alert("Recording error", e?.message || "Unknown error");
        },
      });
    } else if (typeof cam.recordAsync === "function") {
      try {
        const res = await cam.recordAsync({ maxDuration: maxSeg });
        const segDur = (Date.now() - startedAt) / 1000;
        if (res?.uri) {
          setClips(prev => [...prev, res.uri]);
          setClipDurations(prev => [...prev, segDur]);
        }
        setBaseElapsed(prev => Math.min(duration, prev + segDur));
        setRunStart(null);
        setRecording(false);

        if (prevElapsedAfter(segDur) >= duration) finalize();
        else setPaused(true);
      } catch (e: any) {
        setRunStart(null);
        setRecording(false);
        Alert.alert("Recording error", e?.message || "Unknown error");
      }
    } else {
      Alert.alert("Camera", "Recording method not available on this Expo Camera API.");
      setRunStart(null);
      setRecording(false);
    }
  };

  const pauseSegment = () => {
    if (!recording) return;
    camRef.current?.stopRecording?.();
  };

  const deleteLastClip = () => {
    if (recording || clips.length === 0) return;
    const lastDur = clipDurations[clipDurations.length - 1] || 0;
    setClips(prev => prev.slice(0, -1));
    setClipDurations(prev => prev.slice(0, -1));
    setBaseElapsed(prev => Math.max(0, prev - lastDur));
  };

  const finalize = () => {
    if (recording) {
      camRef.current?.stopRecording?.();
      return;
    }
    onDone(clips);
  };

  // ring
  const R = 44, STROKE = 6, CIRC = 2 * Math.PI * R, dash = CIRC * (1 - progress);
  const remainingWhileRun = Math.max(0, Math.ceil(duration - (baseElapsed + (runStart ? (Date.now() - runStart) / 1000 : 0))));
  const remainingWhenPaused = Math.max(0, Math.ceil(duration - baseElapsed));
  const canStartNew = (duration - Math.ceil(baseElapsed)) > 0;

  return (
    <View style={styles.modalContainer}>
      <CameraView
        ref={camRef}
        style={styles.camera}
        facing={facing}
        mode="video"
        videoStabilizationMode="standard"
      />

      {/* top right controls */}
      <View style={styles.topBar}>
        <View style={styles.topBarRight}>
          <TouchableOpacity onPress={() => setFacing(facing === "back" ? "front" : "back")} style={styles.flipButton}>
            <Image source={require("../../assets/images/icons/flip.png")} style={styles.flipIcon} resizeMode="contain" />
          </TouchableOpacity>
        </View>
      </View>

      {/* bottom controls */}
      <View style={styles.controlsContainer}>
        <View style={styles.progressContainer}>
          <Svg width={120} height={120}>
            <Circle cx={60} cy={60} r={R} stroke="rgba(255,255,255,0.2)" strokeWidth={STROKE} fill="none" />
            <Circle
              cx={60} cy={60} r={R}
              stroke="#FF8D16"
              strokeWidth={STROKE}
              strokeDasharray={CIRC}
              strokeDashoffset={dash}
              strokeLinecap="round"
              fill="none"
              rotation={-90}
              origin="60,60"
            />
          </Svg>

          {!recording && !paused && canStartNew && (
            <TouchableOpacity onPress={startSegment} style={styles.recordButtonStart}>
              <Text style={styles.recordButtonText}>{duration}</Text>
            </TouchableOpacity>
          )}

          {recording && (
            <TouchableOpacity onPress={pauseSegment} style={styles.recordButtonPauseSmall}>
              <Text style={styles.recordButtonText}>{remainingWhileRun}</Text>
            </TouchableOpacity>
          )}

          {paused && canStartNew && (
            <TouchableOpacity onPress={startSegment} style={styles.recordButtonResume}>
              <Text style={styles.recordButtonText}>{remainingWhenPaused}</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.finalizeRow}>
          <TouchableOpacity onPress={finalize} disabled={recording} style={recording ? styles.finalizeButtonDisabled : undefined}>
            <Image source={require("../../assets/images/icons/done.png")} style={styles.doneIcon} resizeMode="contain" />
          </TouchableOpacity>

          {paused && clips.length > 0 && (
            <TouchableOpacity onPress={deleteLastClip} style={styles.deleteBtn}>
              <Image source={require("../../assets/images/icons/delete.png")} style={styles.deleteIcon} resizeMode="contain" />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // screen
  screen: { flex: 1, backgroundColor: "#FFE5B4" },

  // header
  header: {
    paddingTop: 14, paddingBottom: 10, paddingHorizontal: 16,
    backgroundColor: "#FFE5B4", flexDirection: "row", alignItems: "center", justifyContent: "space-between",
  },
  headerTitle: { fontSize: 18, fontWeight: "700", color: "#8B4513" },
  nextBtn: { backgroundColor: "#D4611A", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  nextBtnText: { color: "#FFF", fontWeight: "700" },
  nextBtnDisabled: { opacity: 0.4 },

  // cards & layout
  card: {
    margin: 14, padding: 14, borderRadius: 16,
    backgroundColor: "#FFF7ED", shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 10, elevation: 2,
  },
  cardTitle: { fontSize: 16, fontWeight: "700", color: "#8B4513", marginBottom: 10 },
  row: { flexDirection: "row", gap: 12 },
  rowWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  rowMarginTop12: { flexDirection: "row", gap: 12, marginTop: 12 },

  // options
  option: {
    flex: 1, backgroundColor: "#E6C068", borderRadius: 16, padding: 14,
    borderWidth: 2, borderColor: "transparent",
  },
  optionActive: { borderColor: "#D4611A" },
  optionTitle: { fontSize: 16, fontWeight: "800", color: "#8B4513", marginBottom: 4 },
  optionDesc: { fontSize: 12, color: "#8B4513" },

  // hobbies
  selectHobbyTitle: { marginTop: 18, fontSize: 16, fontWeight: "700", color: "#8B4513", marginBottom: 10 },
  hobbyGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginTop: 8 },
  hobbyItem: {
    width: 88, alignItems: "center", paddingVertical: 10, borderRadius: 14,
    backgroundColor: "#FFE5B4", borderWidth: 2, borderColor: "transparent",
  },
  hobbyItemActive: { borderColor: "#D4611A" },
  hobbyText: { marginTop: 6, fontSize: 12, color: "#8B4513" },
  hobbyIconImage: { width: 36, height: 36 },

  // media summary
  mediaSummary: {
    flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: "#E6C068", padding: 12, borderRadius: 12,
  },
  mediaSummaryText: { color: "#8B4513", fontWeight: "600" },
  clipsInfo: { color: "#8B4513", marginBottom: 8 },

  // preview
  previewImage: { width: "100%", height: 220, borderRadius: 12, marginBottom: 12 },
  previewVideo: { width: "100%", height: 240, borderRadius: 12, marginBottom: 12 },

  // caption
  captionTitle: { color: "#8B4513", marginTop: 4, fontSize: 16, fontWeight: "700", marginBottom: 10 },
  caption: {
    minHeight: 110, textAlignVertical: "top", padding: 12, borderRadius: 12,
    backgroundColor: "#FFF", borderWidth: 2, borderColor: "#E6C068", color: "#333",
  },
  counter: { textAlign: "right", color: "rgba(0,0,0,0.5)", marginTop: 4 },

  // chips
  chip: {
    borderWidth: 1,
    borderColor: "#D4611A",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#FFF",
  },
  chipActive: {
    backgroundColor: "#D4611A",
    borderColor: "#D4611A",
  },
  chipText: {
    fontSize: 14,
    color: "#8B4513",
    fontWeight: "500",
  },
  chipTextSelected: { color: "#FFF" },

  // step 3 titles
  hobbyTagTitle: { marginTop: 12, fontSize: 16, fontWeight: "700", color: "#8B4513", marginBottom: 10 },
  categoryTitle: { marginTop: 12, fontSize: 16, fontWeight: "700", color: "#8B4513", marginBottom: 10 },

  // step 2 titles
  videoDurationTitle: { marginTop: 18, fontSize: 16, fontWeight: "700", color: "#8B4513", marginBottom: 10 },

  bottomSpacer: { height: 36 },

  /* ====== Recorder Modal ====== */
  modalContainer: { position: "absolute", left: 0, right: 0, top: 0, bottom: 0, backgroundColor: "#000" },
  camera: { flex: 1 },
  topBar: { position: "absolute", top: 26, left: 20, right: 20, alignItems: "flex-end" },
  topBarRight: { flexDirection: "row", gap: 16 },
  flipButton: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  flipIcon: { width: 54, height: 54, tintColor: "#fff" },

  controlsContainer: { position: "absolute", bottom: 48, left: 0, right: 0, alignItems: "center" },
  progressContainer: { width: 120, height: 120, alignItems: "center", justifyContent: "center" },

  recordButtonStart: { position: "absolute", width: 78, height: 78, borderRadius: 40, backgroundColor: "#FF8D16", alignItems: "center", justifyContent: "center" },
  recordButtonPauseSmall: { position: "absolute", width: 48, height: 48, borderRadius: 16, backgroundColor: "#FF8D16", alignItems: "center", justifyContent: "center" },
  recordButtonResume: { position: "absolute", width: 78, height: 78, borderRadius: 40, backgroundColor: "#FF8D16", alignItems: "center", justifyContent: "center" },
  recordButtonText: { color: "#fff", fontWeight: "800", fontSize: 18 },

  finalizeRow: { marginTop: 12, flexDirection: "row", gap: 18, alignItems: "center" },
  finalizeButtonDisabled: { opacity: 0.5 },
  doneIcon: { width: 36, height: 36 },
  deleteBtn: { paddingVertical: 8, paddingHorizontal: 10, borderRadius: 8 },
  deleteIcon: { width: 36, height: 36, tintColor: "#fff" },
});
