import SvgUri from "expo-svg-uri";
import { StyleSheet, View } from 'react-native';
import { getAirlineLogo } from '../utils/airlines.js';

export const AirlineLogo = ({ iataCode, size = 40, style }) => {
  const logoUrl = getAirlineLogo(iataCode);
  if (!logoUrl) return null;

  return (
    <View style={[styles.container, { width: size, height: size }, style]}>
      <SvgUri width="100%" height="100%" source={{ uri: logoUrl }} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
