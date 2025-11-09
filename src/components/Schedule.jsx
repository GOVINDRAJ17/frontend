import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { CalendarDays, Clock, MapPin, Plus } from "lucide-react";
import { format } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const Schedule = () => {
  const [date, setDate] = useState(new Date());
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user, token } = useAuth();   // Assuming token stored in auth context for auth headers
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      fetchSchedules();
    } else {
      setSchedules([]);
    }
  }, [user]);

  const fetchSchedules = async () => {
    if (!user) return;

    try {
      const response = await fetch(`/schedules?user_id=${user.id}&limit=5&order=asc`, {  // Your backend endpoint and query
        headers: {
          Authorization: `Bearer ${token}`, // Forward auth token if backend requires it
        },
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || "Failed to fetch schedules");
      }
      const data = await response.json();
      setSchedules(data || []);
    } catch (error) {
      console.error("Error fetching schedules:", error);
      toast.error(error.message || "Error fetching schedules");
    }
  };

  const handleAddSchedule = () => {
    if (!user) {
      toast.error("Please login to schedule rides");
      navigate("/auth");
      return;
    }
    toast.info("Schedule feature coming soon!");
  };

  const handleModify = (id) => {
    toast.info("Modify feature coming soon!");
  };

  const handleCancel = async (id) => {
    if (!user) return;

    setLoading(true);
    try {
      const response = await fetch(`/schedules/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: "cancelled" }),
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || "Failed to cancel");
      }
      toast.success("Schedule cancelled");
      fetchSchedules();
    } catch (error) {
      toast.error(error.message || "Failed to cancel");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="schedule" className="py-24 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto">
        <div className="text-center mb-16 animate-on-scroll">
          <h2 className="text-5xl font-bold mb-4">Schedule Your Rides</h2>
          <p className="text-muted-foreground text-xl">Plan ahead for a seamless journey</p>
        </div>

        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Calendar */}
          <Card className="shadow-card hover:shadow-hover transition-all border-2 overflow-hidden rounded-3xl animate-fade-left">
            <CardHeader className="gradient-primary text-white">
              <CardTitle className="flex items-center gap-2 text-white text-2xl">
                <CalendarDays />
                Select Date
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="bg-card rounded-xl p-4 mb-6 border-2 border-primary/20">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  className="rounded-lg pointer-events-auto mx-auto"
                  classNames={{
                    months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                    month: "space-y-4",
                    caption: "flex justify-center pt-1 relative items-center",
                    caption_label: "text-sm font-medium",
                    nav: "space-x-1 flex items-center",
                    nav_button: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
                    table: "w-full border-collapse space-y-1",
                    head_row: "flex",
                    head_cell: "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
                    row: "flex w-full mt-2",
                    cell: "text-center text-sm p-0 relative [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                    day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100 hover:bg-accent hover:text-accent-foreground rounded-md transition-colors",
                    day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                    day_today: "bg-accent text-accent-foreground",
                    day_outside: "text-muted-foreground opacity-50",
                    day_disabled: "text-muted-foreground opacity-50",
                  }}
                />
              </div>
              
              <div className="space-y-4">
                {date && (
                  <div className="bg-gradient-primary text-white p-6 rounded-xl shadow-soft">
                    <div className="text-sm opacity-90 mb-2">Selected Date</div>
                    <div className="text-2xl font-bold">{format(date, "EEEE, MMMM d, yyyy")}</div>
                  </div>
                )}
                
                <Button 
                  className="w-full gradient-primary text-primary-foreground hover:shadow-hover transition-smooth text-lg py-6" 
                  onClick={handleAddSchedule}
                >
                  <Plus className="mr-2" size={20} />
                  Schedule New Ride
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Rides */}
          <Card className="shadow-card hover:shadow-hover transition-all border-2 rounded-3xl animate-fade-right">
            <CardHeader className="gradient-primary text-white">
              <CardTitle className="flex items-center gap-2 text-white text-2xl">
                <Clock />
                Upcoming Rides
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-6">
              {schedules.length > 0 ? (
                schedules.map((ride) => (
                  <Card
                    key={ride.id}
                    className="border-2 hover:shadow-card transition-smooth bg-card overflow-hidden rounded-2xl"
                  >
                    <div className="bg-gradient-primary/10 p-4 border-b-2 border-primary/20">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="bg-gradient-primary rounded-lg p-2">
                            <MapPin size={20} className="text-white" />
                          </div>
                          <div>
                            <div className="font-bold text-lg">{ride.from_location || ride.pickup_location}</div>
                            <div className="text-muted-foreground text-sm">to</div>
                            <div className="font-semibold">{ride.to_location || ride.dropoff_location}</div>
                          </div>
                        </div>
                        <span
                          className={`text-xs px-3 py-1.5 rounded-full font-semibold ${
                            ride.status === "confirmed"
                              ? "bg-green-500/10 text-green-600 border border-green-500/20"
                              : ride.status === "cancelled"
                              ? "bg-red-500/10 text-red-600 border border-red-500/20"
                              : "bg-yellow-500/10 text-yellow-600 border border-yellow-500/20"
                          }`}
                        >
                          {ride.status}
                        </span>
                      </div>
                    </div>
                    
                    <div className="p-4 space-y-3">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-2 text-sm">
                          <CalendarDays size={16} className="text-primary" />
                          <span className="font-medium">{format(new Date(ride.scheduled_date), "MMM d, yyyy")}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Clock size={16} className="text-primary" />
                          <span className="font-medium">{format(new Date(ride.scheduled_date), "h:mm a")}</span>
                        </div>
                      </div>
                      
                      {ride.notes && (
                        <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
                          <strong>Notes:</strong> {ride.notes}
                        </div>
                      )}
                      
                      {ride.status !== "cancelled" && (
                        <div className="flex gap-2 pt-2">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="flex-1 font-semibold"
                            onClick={() => handleModify(ride.id)}
                          >
                            Modify
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="text-destructive hover:text-destructive hover:bg-destructive/10 font-semibold"
                            onClick={() => handleCancel(ride.id)}
                            disabled={loading}
                          >
                            Cancel
                          </Button>
                        </div>
                      )}
                    </div>
                  </Card>
                ))
              ) : (
                <div className="text-center py-16 text-muted-foreground">
                  <div className="bg-muted/50 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-4">
                    <CalendarDays size={48} className="opacity-50" />
                  </div>
                  <p className="font-semibold text-lg mb-2">No upcoming rides scheduled</p>
                  <p className="text-sm">Schedule your first ride to get started!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default Schedule;
