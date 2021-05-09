import React, { useEffect, useState } from "react";
import {
  Text,
  View,
  Image,
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  FlatList,
  Alert,
  RefreshControl,
} from "react-native";
import * as Location from "expo-location";
import styles from "./styles";

const openWeatherKey = `5a94b2ee5e06d87b3adbd7009f5a524c`;
let url = `https://api.openweathermap.org/data/2.5/onecall?&units=metric&exclude=minutely&appid=${openWeatherKey}`;

const Weather = () => {
  const [forecast, setForecast] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadForecast = async () => {
    setRefreshing(true);

    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission to access location was denied");
    }

    let location = await Location.getCurrentPositionAsync({
      enableHighAccuracy: true,
    });

    const response = await fetch(
      `${url}&lat=${location.coords.latitude}&lon=${location.coords.longitude}`
    );
    const data = await response.json();

    if (!response.ok) {
      Alert.alert(`Error retrieving weather data: ${data.message}`);
    } else {
      setForecast(data);
    }

    setRefreshing(false);
  };

  useEffect(() => {
    if (!forecast) {
      loadForecast();
    }
  }, []);

  if (!forecast) {
    return (
      <SafeAreaView style={styles.loading}>
        <ActivityIndicator size="large" color="#e96e50" />
      </SafeAreaView>
    );
  }

  const current = forecast.current.weather[0];
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            onRefresh={() => {
              loadForecast();
            }}
            refreshing={refreshing}
            colors={["#e96e50"]}
          />
        }
      >
        <Text style={styles.title}>Current Weather</Text>
        <View style={styles.current}>
          <Image
            style={styles.largeIcon}
            source={{
              uri: `http://openweathermap.org/img/wn/${current.icon}@4x.png`,
            }}
          />
          <Text style={styles.currentTemp}>
            {Math.round(forecast.current.temp)}°C
          </Text>
        </View>
        <Text style={styles.currentDescription}>{current.description}</Text>
        <View>
          <Text style={styles.subtitle}>Hourly Forecast</Text>
          <FlatList
            showsHorizontalScrollIndicator={false}
            horizontal
            data={forecast.hourly.slice(0, 24)}
            keyExtractor={(item, index) => index.toString()}
            renderItem={(hour) => {
              const weather = hour.item.weather[0];
              var dt = new Date(hour.item.dt * 1000);
              return (
                <View style={styles.hour}>
                  <Text>{dt.toLocaleTimeString().replace(/:\d+ /, " ")}</Text>
                  <Text>{Math.round(hour.item.temp)}°C</Text>
                  <Image
                    style={styles.smallIcon}
                    source={{
                      uri: `http://openweathermap.org/img/wn/${weather.icon}@4x.png`,
                    }}
                  />
                  <Text>{weather.description}</Text>
                </View>
              );
            }}
          />
        </View>
        <Text style={styles.subtitle}>Next 8 Days</Text>
        {forecast.daily.slice(0, 8).map((d) => {
          const weather = d.weather[0];
          var dt = new Date(d.dt * 1000);
          return (
            <View style={styles.day} key={d.dt}>
              <Text style={styles.dayTemp}>{Math.round(d.temp.max)}°C</Text>
              <Image
                style={styles.smallIcon}
                source={{
                  uri: `http://openweathermap.org/img/wn/${weather.icon}@4x.png`,
                }}
              />
              <View style={styles.dayDetails}>
                <Text>{dt.toLocaleDateString()}</Text>
                <Text>{weather.description}</Text>
              </View>
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
};

export default Weather;
